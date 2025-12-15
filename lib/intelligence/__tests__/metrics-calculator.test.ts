import { MetricsCalculator } from '../analytics/metrics-calculator'
import { Trade } from '../core/types'

function makeTrade(overrides: Partial<Trade>): Trade {
  return {
    id: overrides.id || 't1',
    user_id: overrides.user_id || 'u1',
    profile_id: overrides.profile_id || 'p1',
    symbol: overrides.symbol || 'NIFTY',
    side: overrides.side || 'long',
    entry_price: overrides.entry_price ?? 100,
    exit_price: overrides.exit_price ?? 110,
    quantity: overrides.quantity ?? 1,
    pnl: overrides.pnl ?? 10,
    pnl_percentage: overrides.pnl_percentage ?? 0.1,
    gross_pnl: overrides.gross_pnl ?? 10,
    commission: overrides.commission ?? 0,
    entry_time: overrides.entry_time || new Date().toISOString(),
    exit_time: overrides.exit_time || new Date().toISOString(),
    duration_minutes: overrides.duration_minutes ?? 60,
    strategy: overrides.strategy,
    setup: overrides.setup,
    timeframe: overrides.timeframe,
    stop_loss: overrides.stop_loss,
    target: overrides.target,
    initial_risk: overrides.initial_risk ?? 5,
    risk_reward_ratio: overrides.risk_reward_ratio ?? 2,
    slippage: overrides.slippage ?? 0,
    entry_type: overrides.entry_type || 'market',
    exit_type: overrides.exit_type || 'manual',
    emotion_before: overrides.emotion_before,
    emotion_after: overrides.emotion_after,
    rule_followed: overrides.rule_followed ?? true,
    notes: overrides.notes,
    tags: overrides.tags,
    grade: overrides.grade,
    entry_screenshot: overrides.entry_screenshot,
    exit_screenshot: overrides.exit_screenshot,
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: overrides.updated_at || new Date().toISOString(),
  }
}

describe('MetricsCalculator', () => {
  it('calculates basic metrics for mixed trades', () => {
    const calc = new MetricsCalculator()
    const trades: Trade[] = [
      makeTrade({ id: 'w1', pnl: 100 }),
      makeTrade({ id: 'w2', pnl: 50 }),
      makeTrade({ id: 'l1', pnl: -40 }),
    ]

    const m = calc.calculate(trades)

    expect(m.totalTrades).toBe(3)
    expect(m.winningTrades).toBe(2)
    expect(m.losingTrades).toBe(1)
    expect(m.totalPnL).toBe(110)
    expect(m.winRate).toBeCloseTo(2 / 3)
  })
})
