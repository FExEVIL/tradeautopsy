import { InsightGenerator } from '../analytics/insight-generator'
import { FeatureMatrix, Metrics, DetectedPattern } from '../core/types'

describe('InsightGenerator', () => {
  it('generates time optimization insight when certain hours are much better', () => {
    const gen = new InsightGenerator()

    const features: FeatureMatrix = {
      timeDistribution: {},
      dayDistribution: {},
      hourlyWinRates: { '10:00': 0.8, '11:00': 0.2, '12:00': 0.3 },
      strategyPerformance: {},
      setupPerformance: {},
      symbolPerformance: {},
      symbolCorrelations: {},
      performance: {
        winRate: 0.4,
        profitFactor: 1.5,
        avgRR: 2,
        maxDrawdown: 1000,
        sharpeRatio: 1,
        consistencyScore: 60,
      },
      patternFrequencies: {} as any,
      patternCosts: {} as any,
      avgRiskPerTrade: 100,
      ruleViolationRate: 0.2,
      positionSizeVariance: 0,
      labels: {
        totalProfit: 10000,
        riskAdjustedReturn: 0.5,
        consistencyScore: 60,
      },
    }

    const metrics: Metrics = {
      totalTrades: 100,
      winningTrades: 50,
      losingTrades: 50,
      breakEvenTrades: 0,
      winRate: 0.5,
      lossRate: 0.5,
      totalPnL: 10000,
      grossProfit: 15000,
      grossLoss: 5000,
      netProfit: 10000,
      avgWin: 300,
      avgLoss: -150,
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

    const patterns: DetectedPattern[] = []

    const list = gen.generateML(features, metrics, patterns)
    const timeInsight = list.find((i) => i.title?.includes('Time Optimization'))
    expect(timeInsight).toBeDefined()
  })
})
