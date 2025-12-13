// Client-safe utility functions (no server imports)

interface Trade {
  id: string
  notes?: string | null
  execution_rating?: number | null
  setup?: string | null
  mistakes?: string[] | null
  screenshot_url?: string | null
}

export function isJournaled(trade: Partial<Trade>): boolean {
  return Boolean(
    (trade.notes && trade.notes.trim().length > 20) ||
    (trade.execution_rating && trade.execution_rating > 0) ||
    (trade.setup && trade.setup !== 'Uncategorized') ||
    (trade.mistakes && trade.mistakes.length > 0) ||
    trade.screenshot_url
  )
}
