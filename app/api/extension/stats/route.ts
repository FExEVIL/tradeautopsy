import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { format, startOfDay } from 'date-fns'

/**
 * Browser Extension API - Get Today's Stats
 * Returns today's trade count, P&L, and rule violations for extension
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = format(startOfDay(new Date()), 'yyyy-MM-dd')

    // Get today's trades
    const { data: todayTrades, error: tradesError } = await supabase
      .from('trades')
      .select('id, pnl')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('trade_date', `${today}T00:00:00`)
      .lte('trade_date', `${today}T23:59:59`)

    if (tradesError) {
      console.error('Error fetching trades:', tradesError)
    }

    const tradeCount = todayTrades?.length || 0
    const todayPnL = (todayTrades || []).reduce(
      (sum, t) => sum + parseFloat(String(t.pnl || '0')),
      0
    )

    // Get today's rule violations
    const { data: violations, error: violationsError } = await supabase
      .from('rule_violations')
      .select('id')
      .eq('user_id', user.id)
      .gte('violation_time', `${today}T00:00:00`)
      .lte('violation_time', `${today}T23:59:59`)

    if (violationsError) {
      console.error('Error fetching violations:', violationsError)
    }

    return NextResponse.json({
      tradeCount,
      todayPnL,
      violationCount: violations?.length || 0,
      date: today
    })
  } catch (error: any) {
    console.error('Extension stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    )
  }
}
