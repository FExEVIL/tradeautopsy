import { Trade } from '@/types/trade'
import { calculateCumulativePnL } from './calculations'
import { calculateStdDev } from './calculations'

/**
 * Calculate maximum drawdown percentage
 */
export function calculateMaxDrawdown(trades: Trade[]): number {
  if (trades.length === 0) return 0

  const cumulativeData = calculateCumulativePnL(trades as any)
  if (cumulativeData.length === 0) return 0

  let maxDrawdown = 0
  let peak = cumulativeData[0].value

  for (const point of cumulativeData) {
    if (point.value > peak) {
      peak = point.value
    }
    const drawdown = peak > 0 ? ((peak - point.value) / Math.abs(peak)) * 100 : 0
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  return maxDrawdown
}

/**
 * Calculate Sharpe Ratio
 * @param returns Array of daily returns (as decimals, e.g., 0.05 for 5%)
 * @param riskFreeRate Annual risk-free rate (default 6% = 0.06)
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate = 0.06): number {
  if (returns.length === 0) return 0

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const stdDev = calculateStdDev(returns)

  if (stdDev === 0) return 0

  // Annualize: multiply by sqrt(252) for daily returns
  const annualizedReturn = avgReturn * 252
  const annualizedStdDev = stdDev * Math.sqrt(252)
  const annualizedRiskFree = riskFreeRate

  return (annualizedReturn - annualizedRiskFree) / annualizedStdDev
}

/**
 * Calculate Kelly Criterion for optimal position sizing
 * @param winRate Win rate as percentage (e.g., 60 for 60%)
 * @param avgWin Average winning trade amount
 * @param avgLoss Average losing trade amount (as positive number)
 */
export function calculateKellyCriterion(winRate: number, avgWin: number, avgLoss: number): number {
  if (avgLoss === 0) return 0

  const W = winRate / 100
  const R = Math.abs(avgWin / avgLoss)

  const kelly = (W * R - (1 - W)) / R

  // Kelly should be between 0 and 1 (0% to 100% of capital)
  return Math.max(0, Math.min(1, kelly))
}

/**
 * Calculate Sortino Ratio (similar to Sharpe but only penalizes downside volatility)
 */
export function calculateSortinoRatio(returns: number[], riskFreeRate = 0.06): number {
  if (returns.length === 0) return 0

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const downsideReturns = returns.filter(r => r < 0)
  
  if (downsideReturns.length === 0) return 999 // No downside = perfect

  const downsideStdDev = calculateStdDev(downsideReturns)

  if (downsideStdDev === 0) return 999

  const annualizedReturn = avgReturn * 252
  const annualizedDownsideStdDev = downsideStdDev * Math.sqrt(252)
  const annualizedRiskFree = riskFreeRate

  return (annualizedReturn - annualizedRiskFree) / annualizedDownsideStdDev
}

/**
 * Calculate Value at Risk (VaR) at 95% confidence
 * Returns the maximum expected loss over a given period
 */
export function calculateVaR(returns: number[], confidenceLevel = 0.95): number {
  if (returns.length === 0) return 0

  const sortedReturns = [...returns].sort((a, b) => a - b)
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length)
  
  return Math.abs(sortedReturns[index] || 0)
}

/**
 * Calculate maximum consecutive losses
 */
export function calculateMaxConsecutiveLosses(trades: Trade[]): number {
  let maxStreak = 0
  let currentStreak = 0

  for (const trade of trades) {
    const pnl = parseFloat(String(trade.pnl || '0'))
    if (pnl < 0) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}

/**
 * Calculate maximum consecutive wins
 */
export function calculateMaxConsecutiveWins(trades: Trade[]): number {
  let maxStreak = 0
  let currentStreak = 0

  for (const trade of trades) {
    const pnl = parseFloat(String(trade.pnl || '0'))
    if (pnl > 0) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}

/**
 * Calculate recovery factor (Net Profit / Max Drawdown)
 */
export function calculateRecoveryFactor(trades: Trade[]): number {
  const netPnL = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
  const maxDD = calculateMaxDrawdown(trades)

  if (maxDD === 0) return netPnL > 0 ? 999 : 0

  // Convert maxDD from percentage to absolute value
  const cumulativeData = calculateCumulativePnL(trades as any)
  const peak = Math.max(...cumulativeData.map(p => p.value), 0)
  const maxDDAbsolute = (maxDD / 100) * peak

  return maxDDAbsolute > 0 ? netPnL / maxDDAbsolute : 0
}

/**
 * Calculate daily returns from trades
 */
export function calculateDailyReturns(trades: Trade[]): number[] {
  const dailyPnL: Record<string, number> = {}

  trades.forEach(trade => {
    const date = new Date(trade.trade_date).toISOString().split('T')[0]
    dailyPnL[date] = (dailyPnL[date] || 0) + parseFloat(String(trade.pnl || '0'))
  })

  const sortedDates = Object.keys(dailyPnL).sort()
  const returns: number[] = []

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1]
    const currentDate = sortedDates[i]
    
    // Calculate return as percentage change
    const prevValue = dailyPnL[prevDate]
    const currentValue = dailyPnL[currentDate]
    
    if (prevValue !== 0) {
      returns.push((currentValue - prevValue) / Math.abs(prevValue))
    }
  }

  return returns
}

/**
 * Calculate Risk of Ruin
 * Probability of losing entire account given current win rate and risk per trade
 * @param winRate Win rate as percentage (e.g., 60 for 60%)
 * @param avgWin Average winning trade amount
 * @param avgLoss Average losing trade amount (as positive number)
 * @param accountSize Total account size
 * @param riskPerTrade Risk per trade as percentage of account (e.g., 2 for 2%)
 */
export function calculateRiskOfRuin(
  winRate: number,
  avgWin: number,
  avgLoss: number,
  accountSize: number,
  riskPerTrade: number
): number {
  if (accountSize <= 0 || riskPerTrade <= 0) return 0

  const W = winRate / 100
  const R = Math.abs(avgWin / avgLoss)
  const riskDecimal = riskPerTrade / 100

  // Risk of ruin formula: ((1 - W) / W)^(accountSize / riskPerTrade)
  // Simplified version for practical use
  if (W <= 0.5) {
    // High risk if win rate is below 50%
    return Math.min(100, 50 + (0.5 - W) * 100)
  }

  // More sophisticated calculation
  const expectedValue = (W * avgWin) - ((1 - W) * avgLoss)
  if (expectedValue <= 0) {
    return 100 // Guaranteed ruin if expected value is negative
  }

  // Simplified risk of ruin approximation
  const riskPerTradeAmount = accountSize * riskDecimal
  const tradesToRuin = accountSize / riskPerTradeAmount
  const ruinProbability = Math.pow(1 - W, tradesToRuin) * 100

  return Math.min(100, Math.max(0, ruinProbability))
}

/**
 * Calculate optimal position size using fixed fractional method
 * @param accountSize Total account size
 * @param riskPerTrade Risk per trade as percentage (e.g., 2 for 2%)
 * @param entryPrice Entry price of the trade
 * @param stopLoss Stop loss price
 */
export function calculatePositionSize(
  accountSize: number,
  riskPerTrade: number,
  entryPrice: number,
  stopLoss: number
): number {
  if (accountSize <= 0 || riskPerTrade <= 0 || entryPrice <= 0 || stopLoss <= 0) return 0

  const riskAmount = accountSize * (riskPerTrade / 100)
  const priceRisk = Math.abs(entryPrice - stopLoss)

  if (priceRisk === 0) return 0

  return Math.floor(riskAmount / priceRisk)
}

/**
 * Calculate Calmar Ratio (Annual Return / Max Drawdown)
 */
export function calculateCalmarRatio(trades: Trade[]): number {
  if (trades.length === 0) return 0

  const netPnL = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
  const maxDD = calculateMaxDrawdown(trades)

  if (maxDD === 0) return netPnL > 0 ? 999 : 0

  // Estimate annual return (assuming trades span ~1 year, adjust if needed)
  const firstTrade = trades[0]
  const lastTrade = trades[trades.length - 1]
  const daysDiff = Math.max(1, Math.ceil(
    (new Date(lastTrade.trade_date).getTime() - new Date(firstTrade.trade_date).getTime()) / (1000 * 60 * 60 * 24)
  ))
  const annualizedReturn = (netPnL / daysDiff) * 365

  return annualizedReturn / (maxDD / 100 * Math.abs(netPnL))
}
