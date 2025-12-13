export interface Trade {
  id: string
  tradingsymbol: string
  transaction_type: string
  quantity: number
  average_price?: number
  entry_price?: number
  exit_price?: number
  trade_date: string
  pnl: number | null
  pnl_percentage?: number | null // P&L as percentage of investment
  charges?: number | null // Total charges (brokerage, STT, taxes)
  status: string
  side?: string // Optional for backward compatibility
  product?: string
  strategy?: string // Trading strategy
  journal_note?: string
  journal_tags?: string[]
  trade_id?: string | null
  profile_id?: string | null
  broker_id?: string | null
  deleted_at?: string | null
}
