import { TradePredictor } from '../prediction/trade-predictor'
import { Trade, FeatureMatrix, Metrics } from '../core/types'

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

const emptyFeatures: FeatureMatrix = {
  timeDistribution: {},
  dayDistribution: {},
  hourlyWinRates: {},
  strategyPerformance: {},
  setupPerformance: {},
  symbolPerformance: {},
  symbolCorrelations: {},
  performance: {
    winRate: 0.5,
    profitFactor: 1.5,
    avgRR: 2,
    maxDrawdown: 0,
    sharpeRatio: 1,
    consistencyScore: 60,
  },
  patternFrequencies: {} as any,
  patternCosts: {} as any,
  avgRiskPerTrade: 100,
  ruleViolationRate: 0.1,
  positionSizeVariance: 0,
  labels: {
    totalProfit: 10000,
    riskAdjustedReturn: 0.5,
    consistencyScore: 60,
  },
}

const baseMetrics: Metrics = {
  totalTrades: 100,
  winningTrades: 60,
  losingTrades: 40,
  breakEvenTrades: 0,
  winRate: 0.6,
  lossRate: 0.4,
  totalPnL: 10000,
  grossProfit: 15000,
  grossLoss: 5000,
  netProfit: 10000,
  avgWin: 300,
  avgLoss: -125,
  largestWin: 1000,
  largestLoss: -800,
  profitFactor: 3,
  expectancy: 100,
  sharpeRatio: 1,
  sortinoRatio: 1,
  calmarRatio: 1,
  maxDrawdown: 2000,
  maxDrawdownPercent: 0.1,
  avgDrawdown: 1000,
  drawdownDuration: 10,
  recoveryFactor: 5,
  consistencyScore: 60,
  profitableDays: 10,
  profitableWeeks: 4,
  profitableMonths: 1,
  avgDailyPnL: 500,
  dailyPnLStdDev: 100,
  currentStreak: 2,
  longestWinStreak: 5,
  longestLossStreak: 3,
  avgWinStreak: 2,
  avgLossStreak: 2,
  avgRiskReward: 2,
  avgRiskPerTrade: 100,
  maxRiskPerTrade: 200,
  riskAdjustedReturn: 0.5,
  avgTradeDuration: 60,
  avgHoldingTime: 60,
  timeInMarket: 0.5,
  avgSlippage: 0,
  fillRate: 1,
  ruleFollowedRate: 0.8,
  planDeviationRate: 0.2,
  edge: 1,
  edgeDecayRate: 0,
  periodStart: new Date(),
  periodEnd: new Date(),
  calculatedAt: new Date(),
}

describe('TradePredictor', () => {
  it('produces a reasonable prediction based on history', () => {
    const predictor = new TradePredictor()
    const trades: Trade[] = []

    for (let i = 0; i < 30; i++) {
      trades.push(makeTrade({ id: `w${i}`, symbol: 'NIFTY', setup: 'breakout', pnl: 100 }))
    }
    for (let i = 0; i < 10; i++) {
      trades.push(makeTrade({ id: `l${i}`, symbol: 'NIFTY', setup: 'breakout', pnl: -50 }))
    }

    const prediction = predictor.predict(
      { symbol: 'NIFTY', setup: 'breakout' },
      trades,
      emptyFeatures,
      baseMetrics,
    )

    expect(prediction.winProbability).toBeGreaterThan(0.5)
    expect(prediction.expectedPnL).toBeGreaterThan(0)
  })
})
