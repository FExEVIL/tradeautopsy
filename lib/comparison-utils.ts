import { Trade } from '@/types/trade'
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

export interface TimePeriodComparison {
  period: string
  trades: number
  winRate: number
  totalPnL: number
  avgTrade: number
  maxDrawdown: number
}

/**
 * Compare performance across different time periods
 */
export function compareTimePeriods(trades: Trade[]): {
  thisMonth: TimePeriodComparison
  lastMonth: TimePeriodComparison
  thisYear: TimePeriodComparison
  lastYear: TimePeriodComparison
} {
  const now = new Date()
  
  // This month
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)
  const thisMonthTrades = trades.filter(t => {
    const date = new Date(t.trade_date)
    return date >= thisMonthStart && date <= thisMonthEnd
  })

  // Last month
  const lastMonthStart = startOfMonth(subDays(now, 30))
  const lastMonthEnd = endOfMonth(subDays(now, 30))
  const lastMonthTrades = trades.filter(t => {
    const date = new Date(t.trade_date)
    return date >= lastMonthStart && date <= lastMonthEnd
  })

  // This year
  const thisYearStart = startOfYear(now)
  const thisYearEnd = endOfYear(now)
  const thisYearTrades = trades.filter(t => {
    const date = new Date(t.trade_date)
    return date >= thisYearStart && date <= thisYearEnd
  })

  // Last year (approximate - last 365 days from 1 year ago)
  const lastYearStart = startOfYear(subDays(now, 365))
  const lastYearEnd = endOfYear(subDays(now, 365))
  const lastYearTrades = trades.filter(t => {
    const date = new Date(t.trade_date)
    return date >= lastYearStart && date <= lastYearEnd
  })

  const calculateMetrics = (periodTrades: Trade[]): TimePeriodComparison => {
    if (periodTrades.length === 0) {
      return {
        period: '',
        trades: 0,
        winRate: 0,
        totalPnL: 0,
        avgTrade: 0,
        maxDrawdown: 0
      }
    }

    const wins = periodTrades.filter(t => parseFloat(String(t.pnl || '0')) > 0)
    const totalPnL = periodTrades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
    const winRate = (wins.length / periodTrades.length) * 100

    // Simple drawdown calculation
    let cumulative = 0
    let peak = 0
    let maxDD = 0
    for (const trade of periodTrades) {
      cumulative += parseFloat(String(trade.pnl || '0'))
      if (cumulative > peak) peak = cumulative
      const drawdown = peak > 0 ? ((peak - cumulative) / Math.abs(peak)) * 100 : 0
      if (drawdown > maxDD) maxDD = drawdown
    }

    return {
      period: '',
      trades: periodTrades.length,
      winRate,
      totalPnL,
      avgTrade: totalPnL / periodTrades.length,
      maxDrawdown: maxDD
    }
  }

  return {
    thisMonth: { ...calculateMetrics(thisMonthTrades), period: 'This Month' },
    lastMonth: { ...calculateMetrics(lastMonthTrades), period: 'Last Month' },
    thisYear: { ...calculateMetrics(thisYearTrades), period: 'This Year' },
    lastYear: { ...calculateMetrics(lastYearTrades), period: 'Last Year' }
  }
}

/**
 * Calculate percentile ranking (simplified - would need peer data for real percentile)
 * Returns estimated percentile based on common trading benchmarks
 */
export function calculatePercentileRanking(
  winRate: number,
  profitFactor: number,
  sharpeRatio: number
): {
  overall: number
  winRatePercentile: number
  profitFactorPercentile: number
  sharpePercentile: number
} {
  // Estimated percentiles based on common trading statistics
  // Top 10%: winRate > 60%, profitFactor > 2, sharpeRatio > 2
  // Top 25%: winRate > 55%, profitFactor > 1.5, sharpeRatio > 1
  // Top 50%: winRate > 50%, profitFactor > 1, sharpeRatio > 0.5

  const winRatePercentile = 
    winRate >= 60 ? 90 :
    winRate >= 55 ? 75 :
    winRate >= 50 ? 50 :
    winRate >= 45 ? 25 :
    10

  const profitFactorPercentile =
    profitFactor >= 2 ? 90 :
    profitFactor >= 1.5 ? 75 :
    profitFactor >= 1 ? 50 :
    profitFactor >= 0.8 ? 25 :
    10

  const sharpePercentile =
    sharpeRatio >= 2 ? 90 :
    sharpeRatio >= 1 ? 75 :
    sharpeRatio >= 0.5 ? 50 :
    sharpeRatio >= 0 ? 25 :
    10

  const overall = (winRatePercentile + profitFactorPercentile + sharpePercentile) / 3

  return {
    overall,
    winRatePercentile,
    profitFactorPercentile,
    sharpePercentile
  }
}

/**
 * Compare two strategies
 */
export function compareStrategies(
  strategy1Trades: Trade[],
  strategy2Trades: Trade[],
  strategy1Name: string,
  strategy2Name: string
): {
  strategy1: {
    name: string
    trades: number
    winRate: number
    totalPnL: number
    avgTrade: number
  }
  strategy2: {
    name: string
    trades: number
    winRate: number
    totalPnL: number
    avgTrade: number
  }
  winner: string
} {
  const calcMetrics = (trades: Trade[]) => {
    if (trades.length === 0) {
      return { trades: 0, winRate: 0, totalPnL: 0, avgTrade: 0 }
    }
    const wins = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0)
    const totalPnL = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
    return {
      trades: trades.length,
      winRate: (wins.length / trades.length) * 100,
      totalPnL,
      avgTrade: totalPnL / trades.length
    }
  }

  const s1 = calcMetrics(strategy1Trades)
  const s2 = calcMetrics(strategy2Trades)

  const winner = s1.totalPnL > s2.totalPnL ? strategy1Name : 
                 s2.totalPnL > s1.totalPnL ? strategy2Name : 
                 'Tie'

  return {
    strategy1: { name: strategy1Name, ...s1 },
    strategy2: { name: strategy2Name, ...s2 },
    winner
  }
}

