/**
 * Broker-specific CSV import presets
 */

export interface BrokerPreset {
  name: string
  broker: string
  columnMapping: Record<string, string>
  timezone: string
  dateFormat: string
  description: string
}

export const BROKER_PRESETS: Record<string, BrokerPreset> = {
  zerodha: {
    name: 'Zerodha Tradebook',
    broker: 'zerodha',
    columnMapping: {
      tradingsymbol: 'Tradingsymbol',
      transaction_type: 'Transaction Type',
      quantity: 'Quantity',
      average_price: 'Price',
      trade_date: 'Trade Date',
      product: 'Product',
      trade_id: 'Order ID'
    },
    timezone: 'Asia/Kolkata',
    dateFormat: 'yyyy-MM-dd',
    description: 'Standard Zerodha tradebook CSV export'
  },
  upstox: {
    name: 'Upstox Tradebook',
    broker: 'upstox',
    columnMapping: {
      tradingsymbol: 'Symbol',
      transaction_type: 'Side',
      quantity: 'Qty',
      average_price: 'Price',
      trade_date: 'Date',
      product: 'Product Type',
      trade_id: 'Order ID'
    },
    timezone: 'Asia/Kolkata',
    dateFormat: 'dd-MM-yyyy',
    description: 'Standard Upstox tradebook CSV export'
  },
  angel_one: {
    name: 'Angel One Tradebook',
    broker: 'angel_one',
    columnMapping: {
      tradingsymbol: 'Instrument',
      transaction_type: 'Buy/Sell',
      quantity: 'Qty',
      average_price: 'Price',
      trade_date: 'Trade Date',
      product: 'Product',
      trade_id: 'Order No'
    },
    timezone: 'Asia/Kolkata',
    dateFormat: 'dd/MM/yyyy',
    description: 'Standard Angel One tradebook CSV export'
  },
  generic: {
    name: 'Generic CSV',
    broker: 'generic',
    columnMapping: {},
    timezone: 'UTC',
    dateFormat: 'auto-detect',
    description: 'Manual column mapping for any CSV format'
  }
}

/**
 * Auto-detect broker from CSV headers
 */
export function detectBrokerFromHeaders(headers: string[]): string | null {
  const headerStr = headers.join(' ').toLowerCase()
  
  // Zerodha indicators
  if (headerStr.includes('tradingsymbol') && headerStr.includes('transaction type')) {
    return 'zerodha'
  }
  
  // Upstox indicators
  if (headerStr.includes('symbol') && headerStr.includes('side') && headerStr.includes('qty')) {
    return 'upstox'
  }
  
  // Angel One indicators
  if (headerStr.includes('instrument') && headerStr.includes('buy/sell') && headerStr.includes('order no')) {
    return 'angel_one'
  }
  
  return null
}

/**
 * Get preset for broker
 */
export function getPresetForBroker(broker: string): BrokerPreset | null {
  return BROKER_PRESETS[broker] || null
}
