import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email-service'
import { renderWeeklyReport } from '@/lib/email/templates/WeeklyReport'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'

export async function GET(request: NextRequest) {
  // Verify cron secret (if using Vercel Cron)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    
    // Get current day (0 = Sunday, 6 = Saturday)
    const today = new Date()
    const currentDay = today.getDay()
    
    // Get users who want weekly reports on this day
    const { data: users, error: usersError } = await supabase
      .from('email_preferences')
      .select(`
        *,
        user:users!email_preferences_user_id_fkey (
          id,
          email
        )
      `)
      .eq('weekly_report', true)
      .eq('weekly_report_day', currentDay)
      .eq('unsubscribe_all', false)

    if (usersError) {
      throw usersError
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users to send reports to' })
    }

    const weekStart = startOfWeek(today, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
    const weekStartStr = format(weekStart, 'MMM d')
    const weekEndStr = format(weekEnd, 'MMM d, yyyy')

    let successCount = 0
    let errorCount = 0

    for (const preference of users) {
      try {
        const userId = preference.user_id
        const userEmail = (preference.user as any)?.email

        if (!userEmail) continue

        // Get user's trades for the week
        const { data: trades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', userId)
          .gte('trade_date', weekStart.toISOString().split('T')[0])
          .lte('trade_date', weekEnd.toISOString().split('T')[0])
          .is('deleted_at', null)

        if (!trades || trades.length === 0) continue

        // Calculate stats
        const totalPnL = trades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0)
        const winningTrades = trades.filter(t => Number(t.pnl) > 0).length
        const winRate = trades.length > 0 ? Math.round((winningTrades / trades.length) * 100) : 0

        const bestTrade = trades.reduce((best, trade) => {
          const pnl = Number(trade.pnl) || 0
          return pnl > (Number(best.pnl) || 0) ? trade : best
        }, trades[0])

        const worstTrade = trades.reduce((worst, trade) => {
          const pnl = Number(trade.pnl) || 0
          return pnl < (Number(worst.pnl) || 0) ? trade : worst
        }, trades[0])

        // Get user name
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', userId)
          .limit(1)
          .single()

        const userName = profile?.name || 'Trader'

        // Render and send email
        const html = renderWeeklyReport({
          userName,
          weekStart: weekStartStr,
          weekEnd: weekEndStr,
          totalPnL,
          winRate,
          totalTrades: trades.length,
          bestTrade: bestTrade ? {
            symbol: bestTrade.symbol || bestTrade.tradingsymbol || 'Trade',
            pnl: Number(bestTrade.pnl) || 0,
          } : undefined,
          worstTrade: worstTrade ? {
            symbol: worstTrade.symbol || worstTrade.tradingsymbol || 'Trade',
            pnl: Number(worstTrade.pnl) || 0,
          } : undefined,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradeautopsy.com'}/dashboard`,
        })

        const success = await sendEmail({
          to: userEmail,
          subject: `Your Weekly Trading Report - ${weekStartStr} to ${weekEndStr}`,
          html,
        })

        if (success) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        console.error(`[Weekly Report] Error for user ${preference.user_id}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      errors: errorCount,
      total: users.length,
    })
  } catch (error: any) {
    console.error('[Weekly Report Cron] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send weekly reports', details: error.message },
      { status: 500 }
    )
  }
}

