import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import { formatINR } from '@/lib/formatters'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { startDate, endDate, scheduledReportId, profileId } = body

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
    }

    // Get current profile if not provided
    let currentProfileId = profileId
    if (!currentProfileId) {
      const { getCurrentProfileId } = await import('@/lib/profile-utils')
      currentProfileId = await getCurrentProfileId(user.id)
    }

    // Fetch trades (filter by profile)
    let tradesQuery = supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('trade_date', new Date(startDate).toISOString().split('T')[0])
      .lte('trade_date', new Date(endDate).toISOString().split('T')[0])
    
    if (currentProfileId) {
      tradesQuery = tradesQuery.eq('profile_id', currentProfileId)
    }
    
    const { data: trades } = await tradesQuery.order('trade_date', { ascending: false })

    // Generate CSV
    const headers = ['Date', 'Symbol', 'Quantity', 'Entry Price', 'Exit Price', 'P&L', 'Setup', 'Tags', 'Notes']
    const rows = (trades || []).map(trade => [
      format(new Date(trade.trade_date), 'yyyy-MM-dd'),
      trade.symbol || trade.tradingsymbol || 'N/A',
      trade.quantity || 0,
      trade.entry_price || trade.average_price || 0,
      trade.exit_price || 0,
      formatINR(parseFloat(String(trade.pnl || '0'))),
      trade.setup || '',
      Array.isArray(trade.journal_tags) ? trade.journal_tags.join('; ') : '',
      (trade.notes || '').replace(/"/g, '""') // Escape quotes for CSV
    ])

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const csvBlob = new Blob([csvContent], { type: 'text/csv' })

    // Save to report history
    try {
      await supabase.from('report_history').insert({
        user_id: user.id,
        scheduled_report_id: scheduledReportId || null,
        report_type: 'performance',
        report_format: 'csv',
        start_date: startDate,
        end_date: endDate,
        file_size: csvBlob.size,
        email_sent: false
      })
    } catch (historyError) {
      // Don't fail the request if history save fails
      console.error('Failed to save report history:', historyError)
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="TradeAutopsy-Report-${startDate}-to-${endDate}.csv"`
      }
    })
  } catch (error: any) {
    console.error('CSV generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSV', details: error.message },
      { status: 500 }
    )
  }
}

