import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import { calculateCumulativePnL } from './calculations'

export interface Trade {
  id: string
  trade_date: string
  pnl: string | number | null
  quantity: string | number | null
  symbol?: string | null
  notes?: string | null
  journal_tags?: string[] | null
  execution_rating?: number | null
}

export interface DetectedPattern {
  type: string
  frequency: number
  cost?: number
  tradeIds?: string[]
  description?: string
}

export interface AIInsight {
  title: string
  message: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  action?: string
}

/**
 * Analyze recent trades and generate AI insights
 */
export async function analyzeRecentTrades(userId: string, profileId?: string | null): Promise<AIInsight[] | null> {
  const supabase = await createClient()

  // Get current profile if not provided
  if (!profileId) {
    const { getCurrentProfileId } = await import('@/lib/profile-utils')
    profileId = await getCurrentProfileId(userId)
  }

  // Get last 30 trades for analysis (filter by profile)
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
  
  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }
  
  const { data: trades } = await tradesQuery
    .order('trade_date', { ascending: false })
    .limit(30)

  if (!trades || trades.length < 5) {
    return null // Need at least 5 trades for meaningful analysis
  }

  // Detect patterns
  const patterns = detectPatterns(trades as Trade[])

  // Calculate key metrics
  const winRate = calculateWinRate(trades)
  const netPnL = calculateNetPnL(trades)
  const avgTrade = trades.length > 0 ? netPnL / trades.length : 0

  // Generate insights based on patterns and metrics
  const insights: AIInsight[] = []

  // Pattern-based insights
  const revengePattern = patterns.find(p => p.type === 'revenge_trading')
  if (revengePattern && revengePattern.frequency >= 2) {
    insights.push({
      title: 'Revenge Trading Detected',
      message: `You've taken ${revengePattern.frequency} trades within 30 minutes of a loss, costing ₹${Math.abs(revengePattern.cost || 0).toFixed(0)}. This emotional response often leads to bigger losses.`,
      severity: 'warning',
      action: 'Take a 15-minute break after any loss before trading again.'
    })
  }

  const overtradingPattern = patterns.find(p => p.type === 'overtrading')
  if (overtradingPattern && overtradingPattern.frequency >= 2) {
    insights.push({
      title: 'Overtrading Alert',
      message: `You've traded more than 5 times on ${overtradingPattern.frequency} days. Quality over quantity - focus on your best setups only.`,
      severity: 'warning',
      action: 'Set a daily limit of 3-5 trades and stick to it.'
    })
  }

  const fomoPattern = patterns.find(p => p.type === 'fomo')
  if (fomoPattern && fomoPattern.frequency >= trades.length * 0.3) {
    insights.push({
      title: 'FOMO Pattern Detected',
      message: `${Math.round((fomoPattern.frequency / trades.length) * 100)}% of your trades are during high-volatility hours (10-11 AM, 2-3 PM). These often lack proper setup confirmation.`,
      severity: 'info',
      action: 'Wait for your planned setup confirmation before entering trades.'
    })
  }

  // Performance-based insights
  if (winRate < 40 && trades.length >= 10) {
    insights.push({
      title: 'Low Win Rate',
      message: `Your win rate is ${winRate.toFixed(1)}%. Focus on improving entry quality and following your trading plan more strictly.`,
      severity: 'warning',
      action: 'Review your losing trades and identify common mistakes.'
    })
  }

  if (avgTrade < 0 && trades.length >= 10) {
    insights.push({
      title: 'Negative Average Trade',
      message: `Your average trade is losing ₹${Math.abs(avgTrade).toFixed(0)}. Consider tightening stop losses or improving entry timing.`,
      severity: 'critical',
      action: 'Analyze your risk-reward ratio and ensure it\'s at least 1:2.'
    })
  }

  // Positive reinforcement
  if (winRate >= 60 && trades.length >= 10) {
    insights.push({
      title: 'Strong Win Rate',
      message: `Excellent! Your win rate is ${winRate.toFixed(1)}%. Keep following your plan and maintain discipline.`,
      severity: 'success',
      action: 'Continue with your current strategy while managing risk.'
    })
  }

  // If no patterns detected and performance is good
  if (insights.length === 0 && winRate >= 50 && netPnL > 0) {
    insights.push({
      title: 'Keep Up the Good Work',
      message: `You're maintaining a ${winRate.toFixed(1)}% win rate with positive P&L. Stay disciplined and stick to your plan.`,
      severity: 'success',
      action: 'Continue tracking your trades and reviewing your journal entries.'
    })
  }

  return insights.slice(0, 3) // Return top 3 insights
}

/**
 * Detect behavioral patterns in trades
 */
export function detectPatterns(trades: Trade[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = []

  // 1. Revenge trading: Trade within 30 mins of a loss
  const revengeTrades: Trade[] = []
  for (let i = 1; i < trades.length; i++) {
    const trade = trades[i]
    const prevTrade = trades[i - 1]
    
    const timeDiff = new Date(trade.trade_date).getTime() - new Date(prevTrade.trade_date).getTime()
    const isPrevLoss = parseFloat(String(prevTrade.pnl || '0')) < 0
    const isWithin30Mins = timeDiff < 30 * 60 * 1000 // 30 minutes in milliseconds
    
    if (isPrevLoss && isWithin30Mins) {
      revengeTrades.push(trade)
    }
  }

  if (revengeTrades.length > 0) {
    const cost = revengeTrades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
    patterns.push({
      type: 'revenge_trading',
      frequency: revengeTrades.length,
      cost,
      tradeIds: revengeTrades.map(t => t.id)
    })
  }

  // 2. Overtrading: More than 5 trades in a day
  const dailyTradeCounts: Record<string, number> = {}
  trades.forEach(trade => {
    const date = format(new Date(trade.trade_date), 'yyyy-MM-dd')
    dailyTradeCounts[date] = (dailyTradeCounts[date] || 0) + 1
  })

  const overtradingDays = Object.entries(dailyTradeCounts).filter(([_, count]) => count > 5)
  if (overtradingDays.length > 0) {
    patterns.push({
      type: 'overtrading',
      frequency: overtradingDays.length,
      description: `Traded more than 5 times on ${overtradingDays.length} days`
    })
  }

  // 3. FOMO: Trades during high volatility hours (10-11 AM, 2-3 PM)
  const fomoTrades = trades.filter(trade => {
    const hour = new Date(trade.trade_date).getHours()
    return (hour >= 10 && hour < 11) || (hour >= 14 && hour < 15)
  })

  if (fomoTrades.length > trades.length * 0.3) {
    patterns.push({
      type: 'fomo',
      frequency: fomoTrades.length,
      description: `${Math.round((fomoTrades.length / trades.length) * 100)}% of trades during high-volatility hours`,
      tradeIds: fomoTrades.map(t => t.id)
    })
  }

  // 4. Win streak overconfidence: Increased position size after 3+ wins
  let consecutiveWins = 0
  const overconfidentTrades: string[] = []

  for (let i = 0; i < trades.length - 1; i++) {
    const pnl = parseFloat(String(trades[i].pnl || '0'))
    if (pnl > 0) {
      consecutiveWins++
      if (consecutiveWins >= 3) {
        const currentQty = parseFloat(String(trades[i].quantity || '0'))
        const nextQty = parseFloat(String(trades[i + 1].quantity || '0'))
        if (nextQty > currentQty * 1.5) {
          overconfidentTrades.push(trades[i + 1].id)
        }
      }
    } else {
      consecutiveWins = 0
    }
  }

  if (overconfidentTrades.length > 0) {
    patterns.push({
      type: 'win_streak_overconfidence',
      frequency: overconfidentTrades.length,
      tradeIds: overconfidentTrades
    })
  }

  // 5. Revenge sizing: Increased position size after a loss
  const revengeSizingTrades: Trade[] = []
  for (let i = 1; i < trades.length; i++) {
    const trade = trades[i]
    const prevTrade = trades[i - 1]
    
    const isPrevLoss = parseFloat(String(prevTrade.pnl || '0')) < 0
    const prevQty = parseFloat(String(prevTrade.quantity || '0'))
    const currentQty = parseFloat(String(trade.quantity || '0'))
    
    if (isPrevLoss && currentQty > prevQty * 1.5 && prevQty > 0) {
      revengeSizingTrades.push(trade)
    }
  }

  if (revengeSizingTrades.length > 0) {
    const cost = revengeSizingTrades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
    patterns.push({
      type: 'revenge_sizing',
      frequency: revengeSizingTrades.length,
      cost,
      tradeIds: revengeSizingTrades.map(t => t.id),
      description: `Increased position size after losses on ${revengeSizingTrades.length} occasions`
    })
  }

  // 6. Weekend warrior: Trading on weekends (Saturday/Sunday)
  const weekendTrades = trades.filter(trade => {
    const day = new Date(trade.trade_date).getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  })

  if (weekendTrades.length > 0) {
    const cost = weekendTrades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
    patterns.push({
      type: 'weekend_warrior',
      frequency: weekendTrades.length,
      cost,
      tradeIds: weekendTrades.map(t => t.id),
      description: `Traded ${weekendTrades.length} times on weekends (markets typically closed)`
    })
  }

  // 7. News trader: Trading during high volatility periods (first 30 mins and last 30 mins of market)
  const newsTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.trade_date)
    const hour = tradeDate.getHours()
    const minute = tradeDate.getMinutes()
    // First 30 mins (9:30-10:00) or last 30 mins (15:00-15:30) - Indian market hours
    const isOpening = hour === 9 && minute < 30
    const isClosing = hour === 15 && minute >= 0
    return isOpening || isClosing
  })

  if (newsTrades.length > trades.length * 0.25) {
    const cost = newsTrades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
    patterns.push({
      type: 'news_trader',
      frequency: newsTrades.length,
      cost,
      tradeIds: newsTrades.map(t => t.id),
      description: `${Math.round((newsTrades.length / trades.length) * 100)}% of trades during high-volatility opening/closing periods`
    })
  }

  // 8. Loss aversion: Cutting winners early (small profits) and holding losers (big losses)
  const lossAversionTrades: Trade[] = []
  let smallWinners = 0
  let bigLosers = 0

  trades.forEach(trade => {
    const pnl = parseFloat(String(trade.pnl || '0'))
    // Small winners (profit < 200) might indicate cutting winners early
    if (pnl > 0 && pnl < 200) {
      smallWinners++
    }
    // Big losers (loss > 1000) might indicate holding losers too long
    if (pnl < -1000) {
      bigLosers++
      lossAversionTrades.push(trade)
    }
  })

  // If ratio of small winners to big losers is high, it's likely loss aversion
  if (smallWinners > 0 && bigLosers > 0 && (smallWinners / bigLosers) > 2) {
    const cost = lossAversionTrades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
    patterns.push({
      type: 'loss_aversion',
      frequency: lossAversionTrades.length,
      cost,
      tradeIds: lossAversionTrades.map(t => t.id),
      description: `Cutting winners early (${smallWinners} small wins) while holding losers (${bigLosers} big losses)`
    })
  }

  return patterns
}

/**
 * Calculate win rate from trades
 */
function calculateWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const wins = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0).length
  return (wins / trades.length) * 100
}

/**
 * Calculate net P&L from trades
 */
function calculateNetPnL(trades: Trade[]): number {
  return trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
}

/**
 * Store detected patterns in database
 */
export async function storeDetectedPatterns(userId: string, patterns: DetectedPattern[]): Promise<void> {
  const supabase = await createClient()

  for (const pattern of patterns) {
    await supabase.from('detected_patterns').insert({
      user_id: userId,
      pattern_type: pattern.type,
      occurrences: pattern.frequency,
      total_cost: pattern.cost || 0,
      trades_affected: pattern.tradeIds || [],
      metadata: pattern.description ? { description: pattern.description } : {}
    })
  }
}

/**
 * Store AI insights in database
 */
export async function storeAIInsights(userId: string, insights: AIInsight[], triggeredByTradeId?: string): Promise<void> {
  const supabase = await createClient()

  const insightsToInsert = insights.map(insight => ({
    user_id: userId,
    insight_type: 'recommendation',
    title: insight.title,
    message: insight.message,
    severity: insight.severity,
    triggered_by_trade_id: triggeredByTradeId || null
  }))

  await supabase.from('ai_insights').insert(insightsToInsert)
}

