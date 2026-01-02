import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const cookieStore = await cookies()
    const workosProfileId = cookieStore.get('workos_profile_id')?.value
    const activeProfileId = cookieStore.get('active_profile_id')?.value
    
    const effectiveUserId = user?.id || workosProfileId
    
    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const month = searchParams.get('month') // e.g., "2025-12"

    // Build date range
    let dateStart: string
    let dateEnd: string

    if (startDate && endDate) {
      dateStart = startDate
      dateEnd = endDate
    } else if (month) {
      // If month is provided (e.g., "2025-12")
      const [y, m] = month.split('-')
      dateStart = `${y}-${m}-01`
      const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate()
      dateEnd = `${y}-${m}-${lastDay}`
    } else {
      // Default to current month
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      dateStart = `${y}-${m}-01`
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
      dateEnd = `${y}-${m}-${lastDay}`
    }

    console.log('Calendar API - Date range:', { dateStart, dateEnd, effectiveUserId, activeProfileId })

    // Try RPC function first for better performance
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_daily_pnl', {
        p_user_id: effectiveUserId,
        p_start_date: dateStart,
        p_end_date: dateEnd,
        p_profile_id: activeProfileId || null,
      })

      if (!rpcError && rpcData && rpcData.length > 0) {
        // Convert RPC format to dailyData format
        const dailyData: { [date: string]: { pnl: number; trades: any[]; count: number } } = {}
        
        rpcData.forEach((row: any) => {
          const dateKey = row.date ? new Date(row.date).toISOString().split('T')[0] : null
          if (dateKey) {
            dailyData[dateKey] = {
              pnl: parseFloat(String(row.total_pnl || 0)),
              trades: [],
              count: Number(row.trade_count || 0),
            }
          }
        })

        console.log('Calendar API (RPC) - Found days:', Object.keys(dailyData).length)

        return NextResponse.json({
          success: true,
          data: dailyData,
        })
      }
    } catch (rpcErr) {
      console.warn('RPC function failed, using fallback query:', rpcErr)
    }

    // Fallback: Fetch trades and aggregate client-side
    // Use OR condition to match by user_id OR profile_id
    let query = supabase
      .from('trades')
      .select('trade_date, pnl, outcome, symbol, tradingsymbol, notes')
      .is('deleted_at', null)
      .gte('trade_date', dateStart)
      .lte('trade_date', dateEnd + 'T23:59:59.999Z')
      .order('trade_date', { ascending: true })

    // Build OR condition for user matching
    if (activeProfileId && activeProfileId !== effectiveUserId) {
      // Match by user_id OR profile_id
      query = query.or(`user_id.eq.${effectiveUserId},profile_id.eq.${activeProfileId}`)
    } else {
      // Just match by user_id
      query = query.eq('user_id', effectiveUserId)
    }

    const { data: trades, error } = await query

    if (error) {
      console.error('Calendar API error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch trades', details: error.message },
        { status: 500 }
      )
    }

    console.log('Calendar API (Fallback) - Raw trades found:', trades?.length || 0)

    // Group trades by date
    const dailyData: { [key: string]: { pnl: number; trades: any[]; count: number } } = {}

    ;(trades || []).forEach((trade) => {
      // Handle different date formats
      let dateKey: string | null = null
      
      if (trade.trade_date) {
        // Could be "2025-12-10" or "2025-12-10T00:00:00.000Z"
        const dateStr = String(trade.trade_date)
        dateKey = dateStr.split('T')[0]
      }
      
      if (!dateKey) return
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          pnl: 0,
          trades: [],
          count: 0,
        }
      }

      const pnl = parseFloat(String(trade.pnl || 0))
      dailyData[dateKey].pnl += pnl
      dailyData[dateKey].trades.push(trade)
      dailyData[dateKey].count += 1
    })

    console.log('Calendar API - Grouped days:', Object.keys(dailyData).length)
    if (Object.keys(dailyData).length > 0) {
      console.log('Calendar API - Sample dates:', Object.keys(dailyData).slice(0, 3))
    }

    return NextResponse.json({
      success: true,
      data: dailyData,
    })

  } catch (error: any) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
