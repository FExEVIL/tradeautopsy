import { Trade } from '@/types/trade'
import { classifyTradeStrategy, TradeStrategy } from './strategy-classifier'
import { calculateAvgProfit, calculateAvgLoss, calculateRiskRewardRatio } from './calculations'

export interface StrategyMetrics {
  strategy: TradeStrategy
  totalTrades: number
  winRate: number
  totalPnL: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  riskRewardRatio: number
  expectancy: number
  maxWin: number
  maxLoss: number
  avgTrade: number
}

export interface TimeBasedPerformance {
  hour: number
  trades: number
  winRate: number
  totalPnL: number
  avgPnL: number
}

export interface SymbolPerformance {
  symbol: string
  trades: number
  winRate: number
  totalPnL: number
  avgPnL: number
}

export interface SetupPerformance {
  setup: string
  trades: number
  winRate: number
  totalPnL: number
  avgPnL: number
}

/**
 * Analyze performance by strategy
 */
export function analyzeByStrategy(trades: Trade[]): StrategyMetrics[] {
  const strategyMap: Record<TradeStrategy, Trade[]> = {
    'Intraday': [],
    'Delivery': [],
    'Swing': [],
    'Options': [],
    'Unknown': []
  }

  // Group trades by strategy
  trades.forEach(trade => {
    const strategy = classifyTradeStrategy({
      product: trade.product || 'MIS',
      tradingsymbol: trade.tradingsymbol || '',
      transaction_type: trade.transaction_type || 'BUY',
      trade_date: trade.trade_date || null
    })
    strategyMap[strategy].push(trade)
  })

  // Calculate metrics for each strategy
  return Object.entries(strategyMap)
    .filter(([_, strategyTrades]) => strategyTrades.length > 0)
    .map(([strategy, strategyTrades]) => {
      const wins = strategyTrades.filter(t => parseFloat(String(t.pnl || '0')) > 0)
      const losses = strategyTrades.filter(t => parseFloat(String(t.pnl || '0')) < 0)
      const totalPnL = strategyTrades.reduce((sum: number, t: any) => sum + parseFloat(String(t.pnl || '0')), 0)
      const winRate = strategyTrades.length > 0 ? (wins.length / strategyTrades.length) * 100 : 0
      const avgWin = calculateAvgProfit(strategyTrades as any)
      const avgLoss = calculateAvgLoss(strategyTrades as any)
      const profitFactor = Math.abs(avgLoss) > 0 ? (wins.reduce((sum: number, t: any) => sum + parseFloat(String(t.pnl || '0')), 0) / Math.abs(losses.reduce((sum: number, t: any) => sum + parseFloat(String(t.pnl || '0')), 0))) : 0
      const riskRewardRatio = calculateRiskRewardRatio(strategyTrades as any)
      
      // Expectancy = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)
      const winRateDecimal = winRate / 100
      const lossRateDecimal = 1 - winRateDecimal
      const expectancy = (winRateDecimal * avgWin) - (lossRateDecimal * Math.abs(avgLoss))

      const maxWin = wins.length > 0 ? Math.max(...wins.map(t => parseFloat(String(t.pnl || '0')))) : 0
      const maxLoss = losses.length > 0 ? Math.min(...losses.map(t => parseFloat(String(t.pnl || '0')))) : 0

      return {
        strategy: strategy as TradeStrategy,
        totalTrades: strategyTrades.length,
        winRate,
        totalPnL,
        avgWin,
        avgLoss: Math.abs(avgLoss),
        profitFactor,
        riskRewardRatio,
        expectancy,
        maxWin,
        maxLoss,
        avgTrade: totalPnL / strategyTrades.length
      }
    })
    .sort((a, b) => b.totalPnL - a.totalPnL) // Sort by total P&L descending
}

/**
 * Analyze performance by time of day
 */
export function analyzeByTime(trades: Trade[]): TimeBasedPerformance[] {
  const hourlyData: Record<number, Trade[]> = {}

  trades.forEach(trade => {
    const hour = new Date(trade.trade_date).getHours()
    if (!hourlyData[hour]) {
      hourlyData[hour] = []
    }
    hourlyData[hour].push(trade)
  })

  return Object.entries(hourlyData)
    .map(([hour, hourTrades]) => {
      const wins = hourTrades.filter(t => parseFloat(String(t.pnl || '0')) > 0)
      const totalPnL = hourTrades.reduce((sum: number, t: any) => sum + parseFloat(String(t.pnl || '0')), 0)
      const winRate = hourTrades.length > 0 ? (wins.length / hourTrades.length) * 100 : 0

      return {
        hour: parseInt(hour),
        trades: hourTrades.length,
        winRate,
        totalPnL,
        avgPnL: totalPnL / hourTrades.length
      }
    })
    .sort((a, b) => a.hour - b.hour)
}

/**
 * Analyze performance by symbol
 */
export function analyzeBySymbol(trades: Trade[]): SymbolPerformance[] {
  const symbolMap: Record<string, Trade[]> = {}

  trades.forEach(trade => {
    const symbol = trade.tradingsymbol || 'UNKNOWN'
    if (!symbolMap[symbol]) {
      symbolMap[symbol] = []
    }
    symbolMap[symbol].push(trade)
  })

  return Object.entries(symbolMap)
    .filter(([_, symbolTrades]) => symbolTrades.length >= 3) // Only symbols with 3+ trades
    .map(([symbol, symbolTrades]) => {
      const wins = symbolTrades.filter(t => parseFloat(String(t.pnl || '0')) > 0)
      const totalPnL = symbolTrades.reduce((sum: number, t: any) => sum + parseFloat(String(t.pnl || '0')), 0)
      const winRate = symbolTrades.length > 0 ? (wins.length / symbolTrades.length) * 100 : 0

      return {
        symbol,
        trades: symbolTrades.length,
        winRate,
        totalPnL,
        avgPnL: totalPnL / symbolTrades.length
      }
    })
    .sort((a, b) => b.totalPnL - a.totalPnL) // Sort by total P&L descending
    .slice(0, 20) // Top 20 symbols
}

/**
 * Analyze performance by setup
 */
export function analyzeBySetup(trades: Trade[]): SetupPerformance[] {
  const setupMap: Record<string, Trade[]> = {}

  trades.forEach((trade: any) => {
    const setup = trade.setup || trade.setup_type || 'Uncategorized'
    if (!setupMap[setup]) {
      setupMap[setup] = []
    }
    setupMap[setup].push(trade)
  })

  return Object.entries(setupMap)
    .filter(([_, setupTrades]) => setupTrades.length >= 2) // Only setups with 2+ trades
    .map(([setup, setupTrades]) => {
      const wins = setupTrades.filter(t => parseFloat(String(t.pnl || '0')) > 0)
      const totalPnL = setupTrades.reduce((sum: number, t: any) => sum + parseFloat(String(t.pnl || '0')), 0)
      const winRate = setupTrades.length > 0 ? (wins.length / setupTrades.length) * 100 : 0

      return {
        setup,
        trades: setupTrades.length,
        winRate,
        totalPnL,
        avgPnL: totalPnL / setupTrades.length
      }
    })
    .sort((a, b) => b.winRate - a.winRate) // Sort by win rate descending
}

/**
 * Get best and worst performing strategies
 */
export function getBestWorstStrategies(strategyMetrics: StrategyMetrics[]): {
  best: StrategyMetrics | null
  worst: StrategyMetrics | null
} {
  if (strategyMetrics.length === 0) {
    return { best: null, worst: null }
  }

  const sorted = [...strategyMetrics].sort((a, b) => b.totalPnL - a.totalPnL)
  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1]
  }
}

