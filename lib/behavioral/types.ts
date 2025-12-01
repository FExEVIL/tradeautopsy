export interface Trade {
  id: string
  user_id: string
  tradingsymbol: string
  transaction_type: 'BUY' | 'SELL'
  quantity: number
  average_price: number
  entry_price?: number
  exit_price?: number
  trade_date: string
  pnl: number
  product: string
  strategy?: string
  notes?: string
  tags?: string[]
  emotion?: EmotionType
  rating?: number
  setup_type?: SetupType
  created_at: string
}

export type EmotionType = 'Revenge' | 'Fear' | 'Calm' | 'Greedy' | 'Disciplined'
export type SetupType = 'Breakout' | 'Pullback' | 'Reversal' | 'Range'

export interface TagMetric {
  tag: string
  count: number
  winRate: number
  totalPnL: number
  avgPnL: number
}

export interface Pattern {
  type: 'weekday' | 'time' | 'setup' | 'emotion'
  insight: string
  severity: 'info' | 'warning' | 'critical'
  data: any
}

export interface FilterState {
  search: string
  dateRange: { start: Date | null; end: Date | null }
  tags: string[]
  winLoss: 'all' | 'wins' | 'losses' | 'breakeven'
  pnlRange: [number, number]
  timeRange: [number, number]
  setupTypes: SetupType[]
}
