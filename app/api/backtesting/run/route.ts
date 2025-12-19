import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BacktestEngine } from '@/lib/backtesting/backtest-engine';
import { BacktestConfig } from '@/types/backtesting';

// ✅ Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting backtest...');

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[API] Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // ✅ Better request parsing with error handling
    let config: BacktestConfig;
    try {
      config = await request.json();
    } catch (parseError) {
      console.error('[API] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Validate config
    if (!config.symbol || !config.startDate || !config.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, startDate, endDate' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('[API] Config validated, saving to database...');

    // Save config to database
    const { data: savedConfig, error: configError } = await supabase
      .from('backtest_configs')
      .insert({
        user_id: user.id,
        name: config.name,
        strategy_name: config.strategyName,
        legs_config: config.legsConfig,
        symbol: config.symbol,
        start_date: typeof config.startDate === 'string' ? config.startDate : config.startDate.toISOString().split('T')[0],
        end_date: typeof config.endDate === 'string' ? config.endDate : config.endDate.toISOString().split('T')[0],
        initial_capital: config.initialCapital,
        entry_days_to_expiry: config.entryRules.daysToExpiry,
        entry_strike_selection: config.entryRules.strikeSelection,
        exit_target_profit_pct: config.exitRules.targetProfitPct,
        exit_stop_loss_pct: config.exitRules.stopLossPct,
        exit_days_to_expiry: config.exitRules.daysToExpiry,
      })
      .select()
      .single();

    if (configError) {
      console.error('[API] Database error saving config:', configError);
      throw configError;
    }

    console.log('[API] Config saved, creating result entry...');

    // Create pending result entry
    const { data: resultEntry, error: resultError } = await supabase
      .from('backtest_results')
      .insert({
        user_id: user.id,
        config_id: savedConfig.id,
        status: 'running',
      })
      .select()
      .single();

    if (resultError) {
      console.error('[API] Database error creating result:', resultError);
      throw resultError;
    }

    console.log('[API] Running backtest engine...');

    // Run backtest (in production, this should be queued)
    try {
      const engine = new BacktestEngine({ ...config, id: savedConfig.id });
      const result = await engine.runBacktest();

      console.log('[API] Backtest complete, updating database...');

      // Update result in database
      await supabase
        .from('backtest_results')
        .update({
          total_trades: result.totalTrades,
          winning_trades: result.winningTrades,
          losing_trades: result.losingTrades,
          win_rate: result.winRate,
          total_pnl: result.totalPnL,
          avg_win: result.avgWin,
          avg_loss: result.avgLoss,
          largest_win: result.largestWin,
          largest_loss: result.largestLoss,
          max_drawdown: result.maxDrawdown,
          max_drawdown_pct: result.maxDrawdownPct,
          profit_factor: result.profitFactor,
          sharpe_ratio: result.sharpeRatio,
          avg_trade_duration_days: result.avgTradeDuration,
          total_commissions: result.totalCommissions,
          final_capital: result.finalCapital,
          return_pct: result.returnPct,
          equity_curve: result.equityCurve,
          trade_details: result.tradeDetails,
          monthly_returns: result.monthlyReturns,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', resultEntry.id);

      if (updateError) {
        console.error('[API] Error updating result:', updateError);
        throw updateError;
      }

      console.log('[API] Backtest successful');

      return NextResponse.json(
        {
          success: true,
          resultId: resultEntry.id,
          result,
        },
        { headers: corsHeaders }
      );
    } catch (backtestError: any) {
      console.error('[API] Backtest engine error:', backtestError);

      // Update status to failed
      await supabase
        .from('backtest_results')
        .update({
          status: 'failed',
          error_message: backtestError.message,
        })
        .eq('id', resultEntry.id);

      throw backtestError;
    }
  } catch (error: any) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run backtest' },
      { status: 500, headers: corsHeaders }
    );
  }
}
