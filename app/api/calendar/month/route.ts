import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('=== Calendar Month API Called ===')
  
  try {
    // Step 1: Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    const cookieStore = await cookies()
    const workosProfileId = cookieStore.get('workos_profile_id')?.value
    const activeProfileId = cookieStore.get('active_profile_id')?.value
    
    const effectiveUserId = activeProfileId || user?.id || workosProfileId
    
    console.log('Auth check:', { 
      hasSupabaseUser: !!user, 
      workosProfileId, 
      activeProfileId,
      effectiveUserId 
    })
    
    if (!effectiveUserId) {
      console.log('No authenticated user found')
      return NextResponse.json({
        success: true,
        data: [],
        summary: {
          total_pnl: 0,
          total_trades: 0,
          green_days: 0,
          red_days: 0,
          win_rate: 0
        }
      })
    }

    // Step 2: Parse query params
    const searchParams = request.nextUrl.searchParams
    const monthParam = searchParams.get('month')
    const yearParam = searchParams.get('year')
    
    const now = new Date()
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1
    const year = yearParam ? parseInt(yearParam) : now.getFullYear()
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
    
    console.log('Date range:', { month, year, startDate, endDate })

    // Step 3: First, check what columns exist in trades table
    const { data: sampleTrade, error: sampleError } = await supabase
      .from('trades')
      .select('*')
      .limit(1)
      .maybeSingle()
    
    console.log('Sample trade columns:', sampleTrade ? Object.keys(sampleTrade) : 'no trades found')
    if (sampleError) {
      console.warn('Sample trade error (non-fatal):', sampleError.message)
    }
    
    // Step 4: Determine which date column to use
    let dateColumn = 'trade_date'
    if (sampleTrade) {
      if ('trade_date' in sampleTrade && sampleTrade.trade_date) {
        dateColumn = 'trade_date'
      } else if ('entry_date' in sampleTrade && sampleTrade.entry_date) {
        dateColumn = 'entry_date'
      } else if ('date' in sampleTrade && sampleTrade.date) {
        dateColumn = 'date'
      } else if ('created_at' in sampleTrade && sampleTrade.created_at) {
        dateColumn = 'created_at'
      }
    }
    
    console.log('Using date column:', dateColumn)

    // Step 5: Determine which user column to use
    let userColumn = 'user_id'
    if (sampleTrade) {
      if ('user_id' in sampleTrade) {
        userColumn = 'user_id'
      } else if ('profile_id' in sampleTrade) {
        userColumn = 'profile_id'
      } else if ('owner_id' in sampleTrade) {
        userColumn = 'owner_id'
      }
    }
    
    console.log('Using user column:', userColumn)

    // Step 6: Build and execute query
    let query = supabase
      .from('trades')
      .select('*')
    
    // Add user filter
    query = query.eq(userColumn, effectiveUserId)
    
    // Add date range filter
    query = query.gte(dateColumn, startDate)
    query = query.lte(dateColumn, endDate + 'T23:59:59.999Z')
    
    // Filter out deleted trades if column exists
    if (sampleTrade && 'deleted_at' in sampleTrade) {
      query = query.is('deleted_at', null)
    }
    
    // Order by date
    query = query.order(dateColumn, { ascending: true })

    const { data: trades, error: tradesError } = await query

    if (tradesError) {
      console.error('Trades query error:', tradesError)
      
      // Return empty data instead of failing
      return NextResponse.json({
        success: true,
        data: [],
        summary: {
          total_pnl: 0,
          total_trades: 0,
          green_days: 0,
          red_days: 0,
          win_rate: 0
        },
        debug: {
          error: tradesError.message,
          dateColumn,
          userColumn
        }
      })
    }

    console.log('Trades found:', trades?.length || 0)

    // Step 7: Group trades by date
    const dailyData: Record<string, {
      date: string
      pnl: number
      trades_count: number
      wins: number
      losses: number
    }> = {}

    ;(trades || []).forEach((trade: any) => {
      // Get the date value
      const tradeDateValue = trade[dateColumn] || trade.trade_date || trade.entry_date || trade.date
      if (!tradeDateValue) return
      
      // Extract just the date part (YYYY-MM-DD)
      const dateKey = String(tradeDateValue).split('T')[0]
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

      // Get PnL value
      const pnl = parseFloat(trade.pnl) || parseFloat(trade.profit_loss) || parseFloat(trade.pl) || 0
      dailyData[dateKey].pnl += pnl
      dailyData[dateKey].trades_count += 1

      // Determine win/loss
      const outcome = trade.outcome?.toLowerCase() || ''
      const isWin = outcome === 'win' || outcome === 'profit' || outcome === 'won' || pnl > 0
      const isLoss = outcome === 'loss' || outcome === 'lost' || pnl < 0

      if (isWin) {
        dailyData[dateKey].wins += 1
      } else if (isLoss) {
        dailyData[dateKey].losses += 1
      }
    })

    const days = Object.values(dailyData)
    
    console.log('Days with trades:', days.length)

    // Step 8: Calculate summary
    const summary = {
      total_pnl: days.reduce((sum, d) => sum + d.pnl, 0),
      total_trades: days.reduce((sum, d) => sum + d.trades_count, 0),
      total_wins: days.reduce((sum, d) => sum + d.wins, 0),
      total_losses: days.reduce((sum, d) => sum + d.losses, 0),
      green_days: days.filter(d => d.pnl > 0).length,
      red_days: days.filter(d => d.pnl < 0).length,
      trading_days: days.length,
      win_rate: 0
    }

    if (summary.total_trades > 0) {
      summary.win_rate = (summary.total_wins / summary.total_trades) * 100
    }

    console.log('Summary:', summary)

    return NextResponse.json({
      success: true,
      data: days,
      days: days,
      summary
    })

  } catch (error: any) {
    console.error('Calendar API unexpected error:', error)
    
    // Return empty data with error info instead of 500
    return NextResponse.json({
      success: true,
      data: [],
      summary: {
        total_pnl: 0,
        total_trades: 0,
        green_days: 0,
        red_days: 0,
        win_rate: 0
      },
      error: error.message || 'Unknown error'
    })
  }
}
