export type TradeStrategy = 'Intraday' | 'Delivery' | 'Swing' | 'Options' | 'Unknown'

interface Trade {
  product: string
  tradingsymbol: string
  transaction_type: string
  trade_date: string | null
}

export function classifyTradeStrategy(trade: Trade): TradeStrategy {
  // Check product type
  if (trade.product === 'MIS') {
    return 'Intraday'
  }
  
  if (trade.product === 'CNC') {
    return 'Delivery'
  }
  
  if (trade.product === 'NRML') {
    // Check if it's an options trade
    if (trade.tradingsymbol.includes('CE') || trade.tradingsymbol.includes('PE')) {
      return 'Options'
    }
    return 'Swing'
  }
  
  // Check symbol for options indicators
  if (trade.tradingsymbol.includes('CE') || trade.tradingsymbol.includes('PE')) {
    return 'Options'
  }
  
  return 'Unknown'
}

export function getStrategyColor(strategy: TradeStrategy): string {
  switch (strategy) {
    case 'Intraday':
      return 'bg-blue-100 text-blue-700'
    case 'Delivery':
      return 'bg-emerald-100 text-emerald-700'
    case 'Swing':
      return 'bg-purple-100 text-purple-700'
    case 'Options':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export function getStrategyIcon(strategy: TradeStrategy): string {
  switch (strategy) {
    case 'Intraday':
      return '⚡'
    case 'Delivery':
      return '📦'
    case 'Swing':
      return '🔄'
    case 'Options':
      return '🎯'
    default:
      return '❓'
  }
}
