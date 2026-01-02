import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('=== Trades Calendar API Called ===')
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const cookieStore = await cookies()
    const workosProfileId = cookieStore.get('workos_profile_id')?.value
    const activeProfileId = cookieStore.get('active_profile_id')?.value
    
    const effectiveUserId = activeProfileId || user?.id || workosProfileId
    
    console.log('Auth:', { effectiveUserId, hasUser: !!user, activeProfileId })
    
    if (!effectiveUserId) {
      return NextResponse.json({
        success: true,
        data: [],
        summary: { total_pnl: 0, total_trades: 0, green_days: 0, red_days: 0, win_rate: 0 }
      })
    }

    const searchParams = request.nextUrl.searchParams
    
    // Parse date params - support multiple formats
    let startDate: string
    let endDate: string
    
    const monthStr = searchParams.get('month') // "2025-01" or "1"
    const yearStr = searchParams.get('year')
    const start = searchParams.get('start_date')
    const end = searchParams.get('end_date')
    
    if (start && end) {
      startDate = start
      endDate = end
    } else if (monthStr?.includes('-')) {
      const [y, m] = monthStr.split('-')
      startDate = `${y}-${m.padStart(2, '0')}-01`
      const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate()
      endDate = `${y}-${m.padStart(2, '0')}-${lastDay}`
    } else {
      const now = new Date()
      const m = monthStr ? parseInt(monthStr) : now.getMonth() + 1
      const y = yearStr ? parseInt(yearStr) : now.getFullYear()
      startDate = `${y}-${String(m).padStart(2, '0')}-01`
      const lastDay = new Date(y, m, 0).getDate()
      endDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`
    }

    console.log('Fetching trades:', { effectiveUserId, startDate, endDate })

    // Try multiple query strategies
    let trades: any[] = []
    
    // Strategy 1: trade_date column
    const { data: data1, error: error1 } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', effectiveUserId)
      .gte('trade_date', startDate)
      .lte('trade_date', endDate + 'T23:59:59.999Z')
      .is('deleted_at', null)

    if (!error1 && data1?.length) {
      trades = data1
      console.log('Found trades using trade_date:', trades.length)
    } else {
      // Strategy 2: entry_date column
      const { data: data2, error: error2 } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', effectiveUserId)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate + 'T23:59:59.999Z')
        .is('deleted_at', null)

      if (!error2 && data2?.length) {
        trades = data2.map(t => ({ ...t, trade_date: t.entry_date }))
        console.log('Found trades using entry_date:', trades.length)
      } else {
        // Strategy 3: No deleted_at filter
        const { data: data3, error: error3 } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', effectiveUserId)
          .gte('trade_date', startDate)
          .lte('trade_date', endDate + 'T23:59:59.999Z')

        if (!error3 && data3?.length) {
          trades = data3
          console.log('Found trades without deleted_at filter:', trades.length)
        } else {
          console.log('No trades found with any strategy')
          console.log('Errors:', { error1: error1?.message, error2: error2?.message, error3: error3?.message })
        }
      }
    }

    // Group by date
    const dailyData: Record<string, any> = {}

    trades.forEach((trade) => {
      const tradeDate = trade.trade_date || trade.entry_date || trade.date
      if (!tradeDate) return
      
      const dateKey = String(tradeDate).split('T')[0]
      if (!dateKey || dateKey === 'undefined' || dateKey === 'null') return

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          pnl: 0,
          trades_count: 0,
          wins: 0,
          losses: 0
        }
      }

      const pnl = parseFloat(trade.pnl) || 0
      dailyData[dateKey].pnl += pnl
      dailyData[dateKey].trades_count += 1

      if (trade.outcome === 'win' || trade.outcome === 'WIN' || pnl > 0) {
        dailyData[dateKey].wins += 1
      } else if (pnl < 0) {
        dailyData[dateKey].losses += 1
      }
    })

    const days = Object.values(dailyData)

    const summary = {
      total_pnl: days.reduce((sum, d: any) => sum + d.pnl, 0),
      total_trades: days.reduce((sum, d: any) => sum + d.trades_count, 0),
      green_days: days.filter((d: any) => d.pnl > 0).length,
      red_days: days.filter((d: any) => d.pnl < 0).length,
      win_rate: 0
    }

    const totalWins = days.reduce((sum, d: any) => sum + d.wins, 0)
    if (summary.total_trades > 0) {
      summary.win_rate = (totalWins / summary.total_trades) * 100
    }

    return NextResponse.json({
      success: true,
      data: days,
      days: days,
      summary
    })

  } catch (error: any) {
    console.error('Trades Calendar API error:', error)
    return NextResponse.json({
      success: true,
      data: [],
      summary: { total_pnl: 0, total_trades: 0, green_days: 0, red_days: 0, win_rate: 0 },
      error: error.message
    })
  }
}
