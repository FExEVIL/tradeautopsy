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
  status: string
  side: string
  product?: string
  journal_note?: string
  journal_tags?: string[]
}
