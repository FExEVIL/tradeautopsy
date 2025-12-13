import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'

export interface PredictiveAlert {
  type: 'tilt_warning' | 'avoid_trading' | 'best_time' | 'take_break'
  title: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  confidence: number
  triggeredBy: Record<string, any>
}

interface Trade {
  id: string
  trade_date: string
  pnl: string | number | null
  quantity: string | number | null
  symbol?: string | null
}

/**
 * Generate predictive alerts based on trading patterns and current context
 */
export async function generatePredictiveAlerts(userId: string): Promise<PredictiveAlert[]> {
  const supabase = await createClient()
  const alerts: PredictiveAlert[] = []

  // Get last 20 trades
  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('trade_date', { ascending: false })
    .limit(20)

  if (!trades || trades.length < 5) {
    return alerts // Need at least 5 trades for meaningful predictions
  }

  // Check user preferences
  const { data: prefs } = await supabase
    .from('alert_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  // If no preferences exist, create default ones
  if (!prefs) {
    await supabase.from('alert_preferences').insert({
      user_id: userId,
      tilt_warning_enabled: true,
      avoid_trading_enabled: true,
      best_time_enabled: true,
      take_break_enabled: true,
      notification_frequency: 'normal'
    })
    // Use default enabled state
  }

  const preferences = prefs || {
    tilt_warning_enabled: true,
    avoid_trading_enabled: true,
    best_time_enabled: true,
    take_break_enabled: true
  }

  const now = new Date()
  const currentHour = now.getHours()
  const today = format(now, 'yyyy-MM-dd')

  // ALERT 1: Tilt Warning (consecutive losses + increased position size)
  if (preferences.tilt_warning_enabled) {
    const recentTrades = trades.slice(0, 5)
    const consecutiveLosses = recentTrades.filter(t => parseFloat(String(t.pnl || '0')) < 0).length
    const lastTrade = recentTrades[0]

    if (lastTrade && consecutiveLosses >= 2) {
      // Calculate average position size from previous 5 trades (excluding last)
      const previousTrades = trades.slice(1, 6)
      const avgPositionSize = previousTrades.length > 0
        ? previousTrades.reduce((sum, t) => sum + parseFloat(String(t.quantity || '0')), 0) / previousTrades.length
        : parseFloat(String(lastTrade.quantity || '0'))

      const currentPositionSize = parseFloat(String(lastTrade.quantity || '0'))

      if (avgPositionSize > 0 && currentPositionSize > avgPositionSize * 1.5) {
        const increasePercent = Math.round(((currentPositionSize / avgPositionSize) - 1) * 100)
        alerts.push({
          type: 'tilt_warning',
          title: '⚠️ Tilt Warning',
          message: `You've had ${consecutiveLosses} losses recently and increased your position size by ${increasePercent}%. Consider taking a break before trading again.`,
          severity: 'critical',
          confidence: 0.85,
          triggeredBy: {
            consecutiveLosses,
            positionSizeIncrease: currentPositionSize / avgPositionSize,
            lastTradeId: lastTrade.id
          }
        })
      } else if (consecutiveLosses >= 3) {
        // Even without position size increase, 3+ consecutive losses is a tilt warning
        alerts.push({
          type: 'tilt_warning',
          title: '⚠️ Tilt Warning',
          message: `You've had ${consecutiveLosses} consecutive losses. This is a strong emotional trading signal. Take a 15-minute break before your next trade.`,
          severity: 'critical',
          confidence: 0.90,
          triggeredBy: {
            consecutiveLosses,
            recentTradeIds: recentTrades.slice(0, consecutiveLosses).map(t => t.id)
          }
        })
      }
    }
  }

  // ALERT 2: Avoid Trading Now (poor performance at this time historically)
  if (preferences.avoid_trading_enabled) {
    const hourlyPerformance = calculateHourlyPerformance(trades)
    const currentHourPnL = hourlyPerformance[currentHour] || 0
    const tradesAtThisHour = trades.filter(t => {
      const tradeHour = new Date(t.trade_date).getHours()
      return tradeHour === currentHour
    })

    // Only alert if user has at least 5 trades at this hour and average P&L is negative
    if (tradesAtThisHour.length >= 5 && currentHourPnL < -500) {
      alerts.push({
        type: 'avoid_trading',
        title: '🚫 Avoid Trading Now',
        message: `Historically, you lose ₹${Math.abs(currentHourPnL).toFixed(0)} on average between ${currentHour}:00-${currentHour + 1}:00 (based on ${tradesAtThisHour.length} trades). Consider avoiding trades during this time.`,
        severity: 'warning',
        confidence: 0.75,
        triggeredBy: {
          hour: currentHour,
          avgPnL: currentHourPnL,
          tradeCount: tradesAtThisHour.length
        }
      })
    }
  }

  // ALERT 3: Best Trading Time
  if (preferences.best_time_enabled) {
    const hourlyPerformance = calculateHourlyPerformance(trades)
    const bestHourEntry = Object.entries(hourlyPerformance)
      .filter(([_, pnl]) => pnl > 0) // Only positive hours
      .sort(([_, a], [__, b]) => b - a)[0] // Sort by P&L descending

    if (bestHourEntry) {
      const [bestHour, avgPnL] = bestHourEntry
      const bestHourNum = parseInt(bestHour)
      const tradesAtBestHour = trades.filter(t => {
        const tradeHour = new Date(t.trade_date).getHours()
        return tradeHour === bestHourNum
      })

      // Only show if significantly profitable and user has enough data
      if (avgPnL > 1000 && tradesAtBestHour.length >= 5) {
        // Check if it's not the current hour (to avoid redundant alerts)
        if (currentHour !== bestHourNum) {
          alerts.push({
            type: 'best_time',
            title: '✨ Your Best Trading Time',
            message: `Your most profitable hour is ${bestHour}:00-${bestHourNum + 1}:00 with avg P&L of ₹${avgPnL.toFixed(0)} (based on ${tradesAtBestHour.length} trades). Consider focusing trades during this window.`,
            severity: 'info',
            confidence: 0.70,
            triggeredBy: {
              bestHour: bestHourNum,
              avgPnL,
              tradeCount: tradesAtBestHour.length
            }
          })
        }
      }
    }
  }

  // ALERT 4: Take a Break (overtrading today)
  if (preferences.take_break_enabled) {
    const todayTrades = trades.filter(t => {
      const tradeDate = format(new Date(t.trade_date), 'yyyy-MM-dd')
      return tradeDate === today
    })

    if (todayTrades.length >= 5) {
      const todayPnL = todayTrades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)

      if (todayPnL < 0) {
        alerts.push({
          type: 'take_break',
          title: '☕ Consider Taking a Break',
          message: `You've taken ${todayTrades.length} trades today with a net loss of ₹${Math.abs(todayPnL).toFixed(0)}. Taking a break can help reset your mindset and prevent further losses.`,
          severity: 'warning',
          confidence: 0.80,
          triggeredBy: {
            tradesCount: todayTrades.length,
            todayPnL,
            tradeIds: todayTrades.map(t => t.id)
          }
        })
      } else if (todayTrades.length >= 10) {
        // Even if profitable, 10+ trades in a day is overtrading
        alerts.push({
          type: 'take_break',
          title: '☕ Consider Taking a Break',
          message: `You've taken ${todayTrades.length} trades today. Quality over quantity - consider taking a break to maintain focus.`,
          severity: 'info',
          confidence: 0.75,
          triggeredBy: {
            tradesCount: todayTrades.length,
            todayPnL,
            tradeIds: todayTrades.map(t => t.id)
          }
        })
      }
    }
  }

  return alerts
}

/**
 * Calculate average P&L per hour of day
 */
function calculateHourlyPerformance(trades: Trade[]): Record<number, number> {
  const hourlyPnL: Record<number, number[]> = {}

  trades.forEach(trade => {
    const hour = new Date(trade.trade_date).getHours()
    const pnl = parseFloat(String(trade.pnl || '0'))

    if (!hourlyPnL[hour]) {
      hourlyPnL[hour] = []
    }
    hourlyPnL[hour].push(pnl)
  })

  // Calculate average P&L per hour
  return Object.entries(hourlyPnL).reduce((acc, [hour, pnls]) => {
    const avgPnL = pnls.reduce((sum, p) => sum + p, 0) / pnls.length
    acc[parseInt(hour)] = avgPnL
    return acc
  }, {} as Record<number, number>)
}

/**
 * Store alerts in database
 */
export async function storePredictiveAlerts(userId: string, alerts: PredictiveAlert[]): Promise<void> {
  const supabase = await createClient()

  if (alerts.length === 0) return

  const alertsToInsert = alerts.map(alert => ({
    user_id: userId,
    alert_type: alert.type,
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    confidence: alert.confidence,
    triggered_by: alert.triggeredBy
  }))

  await supabase.from('predictive_alerts').insert(alertsToInsert)
}

