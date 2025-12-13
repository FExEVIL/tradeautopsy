import { format, startOfDay, startOfMonth, startOfYear } from 'date-fns'

export type TimeGranularity = 'day' | 'month' | 'year'

interface Trade {
  trade_date: string
  pnl: string | number
}

interface CumulativePnLPoint {
  date: string
  value: number
  dailyPnL: number
}

interface AggregatedDataPoint {
  period: string
  value: number
  count: number
}

export function calculateCumulativePnL(trades: Trade[]): CumulativePnLPoint[] {
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  )
  
  const dailyPnL = sortedTrades.reduce((acc, trade) => {
    const date = format(new Date(trade.trade_date), 'yyyy-MM-dd')
    acc[date] = (acc[date] || 0) + parseFloat(String(trade.pnl || '0'))
    return acc
  }, {} as Record<string, number>)
  
  let runningTotal = 0
  return Object.entries(dailyPnL)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, dailyValue]) => {
      runningTotal += dailyValue
      return {
        date,
        value: runningTotal,
        dailyPnL: dailyValue
      }
    })
}

/**
 * Aggregate trades by time granularity (day, month, year)
 */
export function aggregateTradesByGranularity(
  trades: Trade[],
  granularity: TimeGranularity
): AggregatedDataPoint[] {
  const grouped: Record<string, { pnl: number; count: number }> = {}

  trades.forEach(trade => {
    const date = new Date(trade.trade_date)
    let periodKey: string

    switch (granularity) {
      case 'day':
        periodKey = format(startOfDay(date), 'yyyy-MM-dd')
        break
      case 'month':
        periodKey = format(startOfMonth(date), 'yyyy-MM')
        break
      case 'year':
        periodKey = format(startOfYear(date), 'yyyy')
        break
    }

    if (!grouped[periodKey]) {
      grouped[periodKey] = { pnl: 0, count: 0 }
    }

    grouped[periodKey].pnl += parseFloat(String(trade.pnl || '0'))
    grouped[periodKey].count += 1
  })

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({
      period,
      value: data.pnl,
      count: data.count
    }))
}

/**
 * Calculate cumulative P&L for aggregated data
 */
export function calculateCumulativeFromAggregated(
  aggregated: AggregatedDataPoint[]
): CumulativePnLPoint[] {
  let runningTotal = 0
  return aggregated.map(point => {
    runningTotal += point.value
    return {
      date: point.period,
      value: runningTotal,
      dailyPnL: point.value
    }
  })
}

/**
 * Calculate average profit per winning trade
 */
export function calculateAvgProfit(trades: Trade[]): number {
  const winningTrades = trades.filter(t => {
    const pnl = parseFloat(String(t.pnl || '0'))
    return pnl > 0
  })

  if (winningTrades.length === 0) return 0

  const totalProfit = winningTrades.reduce((sum, t) => {
    return sum + parseFloat(String(t.pnl || '0'))
  }, 0)

  return totalProfit / winningTrades.length
}

/**
 * Calculate average loss per losing trade
 */
export function calculateAvgLoss(trades: Trade[]): number {
  const losingTrades = trades.filter(t => {
    const pnl = parseFloat(String(t.pnl || '0'))
    return pnl < 0
  })

  if (losingTrades.length === 0) return 0

  const totalLoss = losingTrades.reduce((sum, t) => {
    return sum + Math.abs(parseFloat(String(t.pnl || '0')))
  }, 0)

  return totalLoss / losingTrades.length
}

/**
 * Calculate risk-reward ratio (Avg Win / Avg Loss)
 */
export function calculateRiskRewardRatio(trades: Trade[]): number {
  const avgWin = calculateAvgProfit(trades)
  const avgLoss = calculateAvgLoss(trades)

  if (avgLoss === 0) return avgWin > 0 ? 999 : 0
  return avgWin / avgLoss
}

export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
}

export function calculateStdDev(values: number[]): number {
  return Math.sqrt(calculateVariance(values))
}

export function calculateCovariance(x: number[], y: number[]): number {
  if (x.length === 0 || x.length !== y.length) return 0
  const xMean = x.reduce((a, b) => a + b) / x.length
  const yMean = y.reduce((a, b) => a + b) / y.length
  
  return x.reduce((sum, xi, i) => {
    return sum + (xi - xMean) * (y[i] - yMean)
  }, 0) / x.length
}
