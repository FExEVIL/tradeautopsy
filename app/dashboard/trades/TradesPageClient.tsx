'use client'

import { useState, useMemo } from 'react'
import { TradeFilters } from '../components/TradeFilters'
import { TradesTable } from '../components/TradesTable'
import TradeDetailDrawer from '../components/TradeDetailDrawer'
import { classifyTradeStrategy } from '@/lib/strategy-classifier'
import { Trade } from '@/types/trade'
import { TagAnalytics } from '../components/TagAnalytics'
import { TimePatterns } from '../components/TimePatterns'
import { StreakTracking } from '../components/StreakTracking'
import { ExportButton } from '../components/ExportButton'






interface FilterState {
  dateFrom: string
  dateTo: string
  symbol: string
  profitLoss: 'all' | 'profit' | 'loss'
  strategy: 'all' | 'Intraday' | 'Delivery' | 'Swing' | 'Options'
  tag: string 
}

type LastImportInfo = {
  rows: number
  date: string
} | null

export default function TradesPageClient({
  trades,
  lastImport,
}: {
  trades: Trade[]
  lastImport: LastImportInfo
}) {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    symbol: '',
    profitLoss: 'all',
    strategy: 'all',
    tag: 'all',
  })

  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

  // Get unique symbols for filter dropdown
  const symbols = useMemo(() => {
    const uniqueSymbols = Array.from(
      new Set(trades.map((t) => t.tradingsymbol))
    ).sort()
    return uniqueSymbols
  }, [trades])

  // Get unique tags for filter dropdown
const availableTags = useMemo(() => {
  const tagSet = new Set<string>()
  trades.forEach((trade) => {
    trade.journal_tags?.forEach((tag) => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
}, [trades])

  // Apply filters
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // Date From filter
      if (
        filters.dateFrom &&
        new Date(trade.trade_date) < new Date(filters.dateFrom)
      ) {
        return false
      }

      // Date To filter
      if (
        filters.dateTo &&
        new Date(trade.trade_date) > new Date(filters.dateTo)
      ) {
        return false
      }

 // Strategy filter
if (filters.strategy !== 'all') {
  const tradeStrategy = classifyTradeStrategy({
    ...trade,
    product: trade.product || 'MIS',
  })
  if (tradeStrategy !== filters.strategy) {
    return false
  }
}

// Tag filter - ADD THIS BLOCK
if (filters.tag !== 'all') {
  if (!trade.journal_tags?.includes(filters.tag)) {
    return false
  }
}

return true

    })
  }, [trades, filters])

  

  // Calculate stats for filtered trades
  const stats = useMemo(() => {
    const totalPnL = filteredTrades.reduce(
      (sum, t) => sum + (t.pnl || 0),
      0
    )
    const wins = filteredTrades.filter((t) => (t.pnl || 0) > 0).length
    const losses = filteredTrades.filter((t) => (t.pnl || 0) < 0).length
    const winRate =
      filteredTrades.length > 0
        ? (wins / filteredTrades.length) * 100
        : 0

    return { totalPnL, wins, losses, winRate, total: filteredTrades.length }
  }, [filteredTrades])

const handleSaveJournal = async (
  id: string,
  note: string,
  tags: string[]
) => {
  await fetch(`/api/trades/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      note,   // send as 'note'
      tags,   // send as 'tags'
    }),
  })

  setSelectedTrade(null)
}


  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
 {/* Header */}
<div className="mb-4 flex items-start justify-between">
  <div>
    <h1 className="text-3xl font-bold text-white mb-1">All Trades</h1>
    <p className="text-gray-400">
      {stats.total} {stats.total === 1 ? 'trade' : 'trades'}
      {trades.length !== stats.total &&
        ` (filtered from ${trades.length})`}
    </p>
    {lastImport && (
      <p className="text-xs text-gray-500 mt-1">
        Last import:{' '}
        <span className="text-gray-300">
          {lastImport.rows} trades
        </span>{' '}
        on{' '}
        <span className="text-gray-300">
          {new Date(lastImport.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          })}
        </span>
      </p>
    )}
  </div>

  {/* Export Buttons */}
  <ExportButton trades={filteredTrades} />
</div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Total P&L</p>
            <p
              className={`text-3xl font-bold ${
                stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {stats.totalPnL >= 0 ? '+' : ''}₹{stats.totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Win Rate</p>
            <p className="text-3xl font-bold text-white">
              {stats.winRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Wins</p>
            <p className="text-3xl font-bold text-emerald-400">
              {stats.wins}
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Losses</p>
            <p className="text-3xl font-bold text-red-400">
              {stats.losses}
            </p>
          </div>
        </div>

        {/* Streak Tracking - ADD HERE */}
<StreakTracking trades={trades} />


        {/* Tag Analytics */}
        <TagAnalytics trades={filteredTrades} />

        {/* Time Patterns - ADD HERE */}
<TimePatterns trades={filteredTrades} />

        {/* Filters */}
<TradeFilters 
  onFilterChange={setFilters} 
  symbols={symbols}
  availableTags={availableTags}
/>

        {/* Trades Table */}
        <div className="bg-neutral-900 rounded-xl border border-gray-800 overflow-hidden">
          <TradesTable 
            trades={filteredTrades} 
            onTradeClick={setSelectedTrade}
          />
        </div>

        {/* Trade Detail Drawer */}
        <TradeDetailDrawer
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onSave={handleSaveJournal}
        />
      </div>
    </div>
  )
}
