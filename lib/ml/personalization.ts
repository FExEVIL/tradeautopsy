import { createClient } from '@/utils/supabase/server'
import { Trade } from '@/types/trade'

export interface FeatureMatrix {
  userId: string
  profileId?: string
  features: {
    timeOfDay: Record<string, number>
    dayOfWeek: Record<string, number>
    strategy: Record<string, number>
    symbol: Record<string, number>
    winRate: number
    profitFactor: number
    avgRR: number
    maxDrawdown: number
    patternFrequencies: Record<string, number>
    ruleViolationRate: number
  }
  labels: {
    profit: number
    riskAdjustedReturn: number
  }
}

export interface MLInsight {
  insightType: string
  insightText: string
  confidenceScore: number
  metadata: Record<string, any>
}

/**
 * Extract features from trades for ML analysis
 */
export async function extractFeatures(
  userId: string,
  trades: Trade[],
  profileId?: string | null
): Promise<FeatureMatrix> {
  if (trades.length === 0) {
    return {
      userId,
      profileId: profileId || undefined,
      features: {
        timeOfDay: {},
        dayOfWeek: {},
        strategy: {},
        symbol: {},
        winRate: 0,
        profitFactor: 0,
        avgRR: 0,
        maxDrawdown: 0,
        patternFrequencies: {},
        ruleViolationRate: 0
      },
      labels: {
        profit: 0,
        riskAdjustedReturn: 0
      }
    }
  }

  // Time of day analysis
  const timeOfDay: Record<string, number> = {}
  trades.forEach(trade => {
    const date = new Date(trade.trade_date)
    const hour = date.getHours()
    const hourKey = `${Math.floor(hour / 2) * 2}-${Math.floor(hour / 2) * 2 + 2}`
    timeOfDay[hourKey] = (timeOfDay[hourKey] || 0) + 1
  })

  // Day of week analysis
  const dayOfWeek: Record<string, number> = {}
  trades.forEach(trade => {
    const date = new Date(trade.trade_date)
    const day = date.toLocaleDateString('en-US', { weekday: 'long' })
    dayOfWeek[day] = (dayOfWeek[day] || 0) + 1
  })

  // Strategy analysis
  const strategy: Record<string, number> = {}
  trades.forEach(trade => {
    const strat = trade.strategy || 'Unknown'
    strategy[strat] = (strategy[strat] || 0) + 1
  })

  // Symbol analysis
  const symbol: Record<string, number> = {}
  trades.forEach(trade => {
    const sym = trade.tradingsymbol || 'Unknown'
    symbol[sym] = (symbol[sym] || 0) + 1
  })

  // Win rate
  const wins = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0)
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0

  // Profit factor
  const grossProfit = wins.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
  const losses = trades.filter(t => parseFloat(String(t.pnl || '0')) < 0)
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0))
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0

  // Average Risk:Reward (simplified)
  const avgRR = 1.5 // Would need entry/exit prices to calculate properly

  // Max drawdown (simplified)
  let maxDrawdown = 0
  let peak = 0
  let runningTotal = 0
  trades.forEach(trade => {
    runningTotal += parseFloat(String(trade.pnl || '0'))
    if (runningTotal > peak) peak = runningTotal
    const drawdown = peak - runningTotal
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  })

  // Pattern frequencies (would need pattern detection data)
  const patternFrequencies: Record<string, number> = {}

  // Rule violation rate
  const supabase = await createClient()
  const { data: violations } = await supabase
    .from('rule_violations')
    .select('id')
    .eq('user_id', userId)
  
  const ruleViolationRate = trades.length > 0 
    ? ((violations?.length || 0) / trades.length) * 100 
    : 0

  // Labels
  const totalProfit = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
  const riskAdjustedReturn = maxDrawdown > 0 ? totalProfit / maxDrawdown : 0

  return {
    userId,
    profileId: profileId || undefined,
    features: {
      timeOfDay,
      dayOfWeek,
      strategy,
      symbol,
      winRate,
      profitFactor,
      avgRR,
      maxDrawdown,
      patternFrequencies,
      ruleViolationRate
    },
    labels: {
      profit: totalProfit,
      riskAdjustedReturn
    }
  }
}

/**
 * Generate personalized insights using heuristic analysis
 * Phase 1: Simple rule-based insights
 * Phase 2: Can be replaced with actual ML model
 */
export async function generatePersonalizedInsights(
  userId: string,
  profileId?: string | null
): Promise<MLInsight[]> {
  const supabase = await createClient()

  // Get trades for analysis
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('trade_date', { ascending: false })
    .limit(100)

  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }

  const { data: trades } = await tradesQuery

  if (!trades || trades.length < 10) {
    return [] // Need at least 10 trades for meaningful insights
  }

  const features = await extractFeatures(userId, trades as Trade[], profileId)
  const insights: MLInsight[] = []

  // Insight 1: Time optimization
  const timeEntries = Object.entries(features.features.timeOfDay)
  if (timeEntries.length > 0) {
    const sortedTimes = timeEntries.sort((a, b) => b[1] - a[1])
    const bestTime = sortedTimes[0][0]
    const worstTime = sortedTimes[sortedTimes.length - 1][0]

    // Calculate win rate by time (simplified)
    const bestTimeTrades = trades.filter(t => {
      const hour = new Date(t.trade_date).getHours()
      const hourKey = `${Math.floor(hour / 2) * 2}-${Math.floor(hour / 2) * 2 + 2}`
      return hourKey === bestTime
    })
    const bestTimeWinRate = bestTimeTrades.length > 0
      ? (bestTimeTrades.filter(t => parseFloat(String(t.pnl || '0')) > 0).length / bestTimeTrades.length) * 100
      : 0

    if (bestTimeWinRate > features.features.winRate + 10) {
      insights.push({
        insightType: 'time_optimization',
        insightText: `Your win rate in ${bestTime} time slot is ${bestTimeWinRate.toFixed(1)}% vs ${features.features.winRate.toFixed(1)}% overall. Consider focusing on trading during ${bestTime}.`,
        confidenceScore: 0.75,
        metadata: { bestTime, bestTimeWinRate, overallWinRate: features.features.winRate }
      })
    }
  }

  // Insight 2: Strategy recommendation
  const strategyEntries = Object.entries(features.features.strategy)
  if (strategyEntries.length > 1) {
    const strategyPerformance: Array<{ strategy: string; winRate: number; avgPnL: number }> = []
    
    strategyEntries.forEach(([strategy, count]) => {
      const strategyTrades = trades.filter(t => (t.strategy || 'Unknown') === strategy)
      const wins = strategyTrades.filter(t => parseFloat(String(t.pnl || '0')) > 0)
      const winRate = strategyTrades.length > 0 ? (wins.length / strategyTrades.length) * 100 : 0
      const avgPnL = strategyTrades.length > 0
        ? strategyTrades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0) / strategyTrades.length
        : 0
      
      strategyPerformance.push({ strategy, winRate, avgPnL })
    })

    const bestStrategy = strategyPerformance.sort((a, b) => b.avgPnL - a.avgPnL)[0]
    const worstStrategy = strategyPerformance.sort((a, b) => a.avgPnL - b.avgPnL)[0]

    if (bestStrategy.avgPnL > 0 && worstStrategy.avgPnL < 0 && Math.abs(bestStrategy.avgPnL - worstStrategy.avgPnL) > 1000) {
      insights.push({
        insightType: 'strategy_recommendation',
        insightText: `${bestStrategy.strategy} is your best performing strategy (avg ₹${bestStrategy.avgPnL.toFixed(0)}), while ${worstStrategy.strategy} is underperforming (avg ₹${worstStrategy.avgPnL.toFixed(0)}). Consider reducing ${worstStrategy.strategy} trades.`,
        confidenceScore: 0.70,
        metadata: { bestStrategy, worstStrategy }
      })
    }
  }

  // Insight 3: Rule adherence
  if (features.features.ruleViolationRate > 20) {
    insights.push({
      insightType: 'risk_adjustment',
      insightText: `Your rule violation rate is ${features.features.ruleViolationRate.toFixed(1)}%. High violation rates can indicate emotional trading. Review your trading rules and consider stricter enforcement.`,
      confidenceScore: 0.80,
      metadata: { violationRate: features.features.ruleViolationRate }
    })
  }

  // Insight 4: Profit factor
  if (features.features.profitFactor < 1.0 && features.features.profitFactor > 0) {
    insights.push({
      insightType: 'risk_adjustment',
      insightText: `Your profit factor is ${features.features.profitFactor.toFixed(2)} (below 1.0). This means losses exceed gains. Focus on improving win rate or reducing average loss size.`,
      confidenceScore: 0.85,
      metadata: { profitFactor: features.features.profitFactor }
    })
  }

  return insights
}

/**
 * Save insights to database
 */
export async function saveMLInsights(
  userId: string,
  insights: MLInsight[],
  profileId?: string | null
): Promise<void> {
  const supabase = await createClient()

  const insightsToInsert = insights.map(insight => ({
    user_id: userId,
    profile_id: profileId || null,
    insight_type: insight.insightType,
    insight_text: insight.insightText,
    confidence_score: insight.confidenceScore,
    metadata: insight.metadata,
    acknowledged: false
  }))

  if (insightsToInsert.length > 0) {
    await supabase
      .from('ml_insights')
      .insert(insightsToInsert)
  }
}
