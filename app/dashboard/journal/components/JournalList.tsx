'use client'

import { JournalCard } from './JournalCard'

interface AudioJournalEntry {
  id: string
  audio_url: string
  transcript: string
  summary: string
  duration: number
  emotions: string[]
  insights: string[]
  tags: string[]
  created_at: string
}

interface Trade {
  id: string
  symbol: string
  tradingsymbol: string
  trade_date: string
  trade_type: string
  transaction_type: string
  quantity: number
  price: number
  average_price: number
  pnl: number | null
  strategy: string
  notes: string | null
  emotions: string[] | null
  tags: string[] | null
  has_audio_journal: boolean
  audio_journal_entries?: AudioJournalEntry[]
}

interface JournalListProps {
  trades: Trade[]
  searchTerm?: string
}

export function JournalList({ trades, searchTerm = '' }: JournalListProps) {
  // Filter by search term if provided
  const filteredTrades = searchTerm
    ? trades.filter(trade => {
        const searchLower = searchTerm.toLowerCase()
        const symbol = (trade.symbol || trade.tradingsymbol || '').toLowerCase()
        const notes = (trade.notes || '').toLowerCase()
        const transcript = trade.audio_journal_entries?.[0]?.transcript?.toLowerCase() || ''
        const summary = trade.audio_journal_entries?.[0]?.summary?.toLowerCase() || ''
        
        return (
          symbol.includes(searchLower) ||
          notes.includes(searchLower) ||
          transcript.includes(searchLower) ||
          summary.includes(searchLower)
        )
      })
    : trades

  if (filteredTrades.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No journal entries found</p>
        <p className="text-sm text-gray-500 mt-2">
          {searchTerm 
            ? 'Try adjusting your search or filters'
            : 'Record your first audio note or add text notes to your trades'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredTrades.map((trade) => (
        <JournalCard key={trade.id} trade={trade} />
      ))}
    </div>
  )
}
