import { Trade } from '@/types/trade'
import { classifyTradeStrategy } from './strategy-classifier'
import { format } from 'date-fns'

export interface AutomationResult {
  tags?: string[]
  strategy?: string
  setup?: string
  notes?: string
}

/**
 * Auto-tag trades based on patterns and characteristics
 */
export function autoTagTrade(trade: Trade): string[] {
  const tags: string[] = []
  const pnl = parseFloat(String(trade.pnl || '0'))
  const hour = new Date(trade.trade_date).getHours()

  // Outcome tags
  if (pnl > 0) {
    tags.push('winner')
    if (pnl > 2000) tags.push('big-win')
  } else if (pnl < 0) {
    tags.push('loser')
    if (pnl < -2000) tags.push('big-loss')
  } else {
    tags.push('scratch')
  }

  // Time-based tags
  if (hour >= 9 && hour < 12) {
    tags.push('morning')
  } else if (hour >= 12 && hour < 15) {
    tags.push('afternoon')
  } else if (hour >= 15 && hour < 16) {
    tags.push('closing')
  }

  // Strategy tags
  const strategy = classifyTradeStrategy({
    product: trade.product || 'MIS',
    tradingsymbol: trade.tradingsymbol || '',
    transaction_type: trade.transaction_type || 'BUY',
    trade_date: trade.trade_date || null
  })
  tags.push(strategy.toLowerCase())

  // Symbol-based tags
  if (trade.tradingsymbol) {
    if (trade.tradingsymbol.includes('NIFTY')) tags.push('index')
    if (trade.tradingsymbol.includes('BANKNIFTY')) tags.push('index')
    if (trade.tradingsymbol.includes('CE') || trade.tradingsymbol.includes('PE')) tags.push('options')
  }

  // Setup tags (if setup exists)
  if ((trade as any).setup) {
    tags.push((trade as any).setup.toLowerCase().replace(/\s+/g, '-'))
  }

  return Array.from(new Set(tags)) // Remove duplicates
}

/**
 * Auto-categorize strategy
 */
export function autoCategorizeStrategy(trade: Trade): string {
  return classifyTradeStrategy({
    product: trade.product || 'MIS',
    tradingsymbol: trade.tradingsymbol || '',
    transaction_type: trade.transaction_type || 'BUY',
    trade_date: trade.trade_date || null
  })
}

/**
 * Auto-detect setup based on trade characteristics
 */
export function autoDetectSetup(trade: Trade): string {
  const pnl = parseFloat(String(trade.pnl || '0'))
  const hour = new Date(trade.trade_date).getHours()
  const symbol = trade.tradingsymbol || ''

  // If setup already exists, return it
  if ((trade as any).setup && (trade as any).setup !== 'Uncategorized') {
    return (trade as any).setup
  }

  // Simple setup detection based on patterns
  // This is a basic implementation - could be enhanced with ML
  if (symbol.includes('NIFTY') || symbol.includes('BANKNIFTY')) {
    if (hour >= 9 && hour < 11) {
      return 'Opening Range Breakout'
    }
    if (hour >= 14 && hour < 15) {
      return 'Closing Range'
    }
    return 'Index Trading'
  }

  if (symbol.includes('CE') || symbol.includes('PE')) {
    return 'Options Strategy'
  }

  return 'Uncategorized'
}

/**
 * Generate smart suggestions based on trade
 */
export function generateSmartSuggestions(trade: Trade, recentTrades: Trade[]): string[] {
  const suggestions: string[] = []
  const pnl = parseFloat(String(trade.pnl || '0'))
  const hour = new Date(trade.trade_date).getHours()

  // Check for patterns
  if (recentTrades.length > 0) {
    const lastTrade = recentTrades[recentTrades.length - 1]
    const lastPnL = parseFloat(String(lastTrade.pnl || '0'))
    const timeDiff = new Date(trade.trade_date).getTime() - new Date(lastTrade.trade_date).getTime()

    // Revenge trading suggestion
    if (lastPnL < 0 && timeDiff < 30 * 60 * 1000 && pnl < 0) {
      suggestions.push('Consider taking a break after losses')
    }

    // Overtrading suggestion
    const todayTrades = recentTrades.filter(t => {
      const tradeDate = new Date(t.trade_date).toISOString().split('T')[0]
      const today = new Date().toISOString().split('T')[0]
      return tradeDate === today
    })
    if (todayTrades.length >= 5) {
      suggestions.push('You\'ve taken many trades today - focus on quality')
    }
  }

  // Time-based suggestions
  if (hour >= 14 && hour < 15) {
    suggestions.push('High volatility during closing hours - be cautious')
  }

  // P&L based suggestions
  if (pnl < -1000) {
    suggestions.push('Review stop loss placement for this trade')
  }

  return suggestions
}

/**
 * Apply automation to a trade
 */
export function applyAutomation(
  trade: Trade,
  recentTrades: Trade[],
  preferences: {
    autoTagEnabled: boolean
    autoCategorizeEnabled: boolean
    autoDetectSetupEnabled: boolean
  }
): AutomationResult {
  const result: AutomationResult = {}

  if (preferences.autoTagEnabled) {
    result.tags = autoTagTrade(trade)
  }

  if (preferences.autoCategorizeEnabled) {
    result.strategy = autoCategorizeStrategy(trade)
  }

  if (preferences.autoDetectSetupEnabled) {
    result.setup = autoDetectSetup(trade)
  }

  return result
}

