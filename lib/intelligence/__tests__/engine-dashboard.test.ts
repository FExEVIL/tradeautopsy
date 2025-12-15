import { IntelligenceEngine } from '../core/engine'
import { UnifiedContext, Metrics, AdvancedMetrics, FeatureMatrix, CoachPersonality, EmotionalState } from '../core/types'

function makeEmptyMetrics(): Metrics {
  const now = new Date()
  return {
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    breakEvenTrades: 0,
    winRate: 0,
    lossRate: 0,
    totalPnL: 0,
    grossProfit: 0,
    grossLoss: 0,
    netProfit: 0,
    avgWin: 0,
    avgLoss: 0,
    largestWin: 0,
    largestLoss: 0,
    profitFactor: 0,
    expectancy: 0,
    sharpeRatio: 0,
    sortinoRatio: 0,
    calmarRatio: 0,
    maxDrawdown: 0,
    maxDrawdownPercent: 0,
    avgDrawdown: 0,
    drawdownDuration: 0,
    recoveryFactor: 0,
    consistencyScore: 0,
    profitableDays: 0,
    profitableWeeks: 0,
    profitableMonths: 0,
    avgDailyPnL: 0,
    dailyPnLStdDev: 0,
    currentStreak: 0,
    longestWinStreak: 0,
    longestLossStreak: 0,
    avgWinStreak: 0,
    avgLossStreak: 0,
    avgRiskReward: 0,
    avgRiskPerTrade: 0,
    maxRiskPerTrade: 0,
    riskAdjustedReturn: 0,
    avgTradeDuration: 0,
    avgHoldingTime: 0,
    timeInMarket: 0,
    avgSlippage: 0,
    fillRate: 1,
    ruleFollowedRate: 0,
    planDeviationRate: 0,
    edge: 0,
    edgeDecayRate: 0,
    periodStart: now,
    periodEnd: now,
    calculatedAt: now,
  }
}

function makeAdvancedMetrics(): AdvancedMetrics {
  return {
    ...makeEmptyMetrics(),
    var95: 0,
    var99: 0,
    cvar95: 0,
    rolling7DayReturn: 0,
    rolling30DayReturn: 0,
    rolling90DayReturn: 0,
    attribution: {
      byStrategy: {},
      bySymbol: {},
      byTimeOfDay: {},
      byDayOfWeek: {},
      byMarketCondition: {},
    },
    pnlZScore: 0,
    winRateZScore: 0,
    drawdownZScore: 0,
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
    winRate: 0,
    profitFactor: 0,
    avgRR: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    consistencyScore: 0,
  },
  patternFrequencies: {} as any,
  patternCosts: {} as any,
  avgRiskPerTrade: 0,
  ruleViolationRate: 0,
  positionSizeVariance: 0,
  labels: {
    totalProfit: 0,
    riskAdjustedReturn: 0,
    consistencyScore: 0,
  },
}

const defaultPersonality: CoachPersonality = {
  id: 'balanced',
  name: 'Balanced',
  style: 'balanced',
  strictness: 5,
  encouragement: 5,
  technicalDepth: 5,
  humorLevel: 3,
  empathy: 5,
  directness: 5,
  responseLength: 'moderate',
  usesEmojis: false,
  usesMetaphors: true,
  focusAreas: ['risk', 'psychology'],
  systemPrompt: 'You are a coach.',
}

const neutralEmotion: EmotionalState = {
  primary: 'neutral',
  intensity: 0.3,
  triggers: [],
  suggestions: [],
}

describe('IntelligenceEngine getDashboard', () => {
  it('returns quickStats and sections from a minimal context', () => {
    const engine = new IntelligenceEngine() as any

    const context: UnifiedContext = {
      userId: 'u1',
      profileId: 'p1',
      recentTrades: [],
      todayTrades: [],
      sessionTrades: [],
      openPositions: [],
      metrics: makeEmptyMetrics(),
      advancedMetrics: makeAdvancedMetrics(),
      features: emptyFeatures,
      activePatterns: [],
      patternHistory: [],
      patternInteractions: [],
      currentRiskScore: 0,
      portfolioHeat: 0,
      marketRegime: 'ranging',
      pendingInsights: [],
      deliveredInsights: [],
      coachPersonality: defaultPersonality,
      chatHistory: [],
      emotionalState: neutralEmotion,
      achievements: [],
      skills: [],
      activeChallenges: [],
      currentPlan: null,
      lastInteraction: new Date(),
      sessionStart: new Date(),
      preferences: {
        riskTolerance: 'moderate',
        tradingStyle: [],
        preferredSymbols: [],
        preferredStrategies: [],
        coachPersonalityId: 'balanced',
        checkInSchedule: {
          morningBriefing: true,
          preTrade: true,
          midDay: false,
          eveningReview: true,
        },
        notificationLevel: 'important',
        channels: { inApp: true, email: false },
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        theme: 'dark',
      },
    }

    engine.context = context
    const dashboard = engine.getDashboard()

    expect(dashboard.quickStats).toBeDefined()
    expect(dashboard.metrics).toBeDefined()
    expect(Array.isArray(dashboard.activePatterns)).toBe(true)
  })
})
