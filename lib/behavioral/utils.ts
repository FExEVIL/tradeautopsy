import { Trade, TagMetric, Pattern } from './types'

export function calculateTagMetrics(trades: Trade[]): TagMetric[] {
  const tagMap = new Map<string, { wins: number; total: number; pnl: number }>()

  trades.forEach((trade) => {
    trade.tags?.forEach((tag) => {
      const existing = tagMap.get(tag) || { wins: 0, total: 0, pnl: 0 }
      tagMap.set(tag, {
        wins: existing.wins + (trade.pnl > 0 ? 1 : 0),
        total: existing.total + 1,
        pnl: existing.pnl + trade.pnl,
      })
    })
  })

  return Array.from(tagMap.entries())
    .map(([tag, data]) => ({
      tag,
      count: data.total,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      totalPnL: data.pnl,
      avgPnL: data.total > 0 ? data.pnl / data.total : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate)
}

export function detectPatterns(trades: Trade[]): Pattern[] {
  const patterns: Pattern[] = []

  if (trades.length < 30) {
    return patterns
  }

  // Weekday analysis
  const weekdayPerformance = new Map<number, { pnl: number; count: number }>()
  trades.forEach((trade) => {
    const day = new Date(trade.trade_date).getDay()
    const existing = weekdayPerformance.get(day) || { pnl: 0, count: 0 }
    weekdayPerformance.set(day, {
      pnl: existing.pnl + trade.pnl,
      count: existing.count + 1,
    })
  })

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  let worstDay = { day: 0, avgPnl: 0 }
  weekdayPerformance.forEach((data, day) => {
    const avgPnl = data.pnl / data.count
    if (avgPnl < worstDay.avgPnl) {
      worstDay = { day, avgPnl }
    }
  })

  if (worstDay.avgPnl < -500) {
    patterns.push({
      type: 'weekday',
      insight: `You average ₹${worstDay.avgPnl.toFixed(0)} on ${dayNames[worstDay.day]}s. Consider reducing position size by 50%.`,
      severity: 'warning',
      data: weekdayPerformance,
    })
  }

  // Revenge trading detection
  for (let i = 1; i < trades.length; i++) {
    const prevTrade = trades[i - 1]
    const currTrade = trades[i]
    
    if (prevTrade.pnl < 0) {
      const timeDiff = new Date(currTrade.trade_date).getTime() - new Date(prevTrade.trade_date).getTime()
      const minutesDiff = timeDiff / (1000 * 60)
      
      if (minutesDiff < 5 && currTrade.pnl < 0) {
        patterns.push({
          type: 'emotion',
          insight: `Revenge trading detected: You entered a trade ${minutesDiff.toFixed(0)} minutes after a loss and lost again. Take a 15-minute break after losses.`,
          severity: 'critical',
          data: { prevTrade, currTrade },
        })
        break
      }
    }
  }

  return patterns
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  const prefix = currency === 'INR' ? '₹' : '$'
  const absAmount = Math.abs(amount)
  return `${prefix}${absAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}
