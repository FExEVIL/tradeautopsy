'use client'

import { useState, useMemo, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { Trade, FilterState } from '@/lib/behavioral/types'
import StatsGrid from './components/StatsGrid'
import FilterBar from './components/FilterBar'
import TradeCard from './components/TradeCard'
import InsightsPanel from './components/InsightsPanel'

interface JournalClientProps {
  initialTrades: Trade[]
}

const initialFilters: FilterState = {
  search: '',
  dateRange: { start: null, end: null },
  tags: [],
  winLoss: 'all',
  pnlRange: [-1000000, 1000000],
  timeRange: [9, 15],
  setupTypes: [],
}

export default function JournalClient({ initialTrades }: JournalClientProps) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades)
  const [filters, setFilters] = useState<FilterState>(initialFilters)
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

   useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      console.log('journal page user', data.user?.id)
    })
  }, [supabase])

const filteredTrades = useMemo(() => {
  return trades.filter((trade) => {
    // Search
    if (filters.search) {
      const s = filters.search.toLowerCase()
      const matchSymbol = trade.tradingsymbol.toLowerCase().includes(s)
      const matchNotes = (trade.notes || '').toLowerCase().includes(s)
      const matchTags = (trade.tags || []).some((t) => t.toLowerCase().includes(s))
      if (!matchSymbol && !matchNotes && !matchTags) return false
    }

    // Win/Loss filter
    if (filters.winLoss === 'wins' && trade.pnl <= 0) return false
    if (filters.winLoss === 'losses' && trade.pnl >= 0) return false
    if (filters.winLoss === 'breakeven' && trade.pnl !== 0) return false

    return true
  })
}, [trades, filters])

  const handleTradeUpdate = () => {
    setTrades([...trades])
  }

  return (
    <div className="min-h-screen bg-[#050608] px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-white mb-2">Trading Journal</h1>
        <p className="text-sm text-gray-400 mb-6">
          Deep-dive into your execution quality and behavior.
        </p>

        <StatsGrid trades={filteredTrades} />

        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(initialFilters)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: trade cards */}
          <div className="lg:col-span-2 space-y-4">
            {filteredTrades.map((trade) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                onUpdate={handleTradeUpdate}
              />
            ))}

            {filteredTrades.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No trades to display yet.
              </div>
            )}
          </div>

          {/* Right: behavioral insights */}
          <div className="lg:col-span-1">
            <InsightsPanel trades={filteredTrades} />
          </div>
        </div>
      </div>
    </div>
  )
}
