import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ✅ Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Fetch backtest configs and results
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'configs'

    if (type === 'configs') {
      const { data, error } = await supabase
        .from('backtest_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return NextResponse.json({ data }, { headers: corsHeaders })
    }

    if (type === 'results') {
      const { data, error } = await supabase
        .from('backtest_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return NextResponse.json({ data }, { headers: corsHeaders })
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('[API] Error fetching backtesting data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch backtesting data' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST - Create new backtest config or run backtest
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create_config') {
      const { data: config, error } = await supabase
        .from('backtest_configs')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ data: config }, { headers: corsHeaders })
    }

    if (action === 'run_backtest') {
      // TODO: Implement actual backtesting logic
      // For now, return a mock result
      const { data: result, error } = await supabase
        .from('backtest_results')
        .insert({
          user_id: user.id,
          config_id: data.configId,
          status: 'completed',
          total_trades: 0,
          winning_trades: 0,
          losing_trades: 0,
          win_rate: 0,
          total_pnl: 0,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ data: result }, { headers: corsHeaders })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('[API] Error in backtesting POST:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500, headers: corsHeaders }
    )
  }
}
