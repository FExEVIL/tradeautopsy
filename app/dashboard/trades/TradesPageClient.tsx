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
import SearchBar from '../components/SearchBar'
import { useDebounce } from '@/lib/useDebounce'

type SortField = 'date' | 'symbol' | 'pnl' | 'quantity' | 'strategy' | null
type SortDirection = 'asc' | 'desc'

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
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const symbols = useMemo(() => {
    const uniqueSymbols = Array.from(
      new Set(trades.map((t) => t.tradingsymbol))
    ).sort()
    return uniqueSymbols
  }, [trades])

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    trades.forEach((trade) => {
      trade.journal_tags?.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [trades])

  const filteredTrades = useMemo(() => {
    let result = trades.filter((trade) => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase()
        const matchesSymbol = trade.tradingsymbol.toLowerCase().includes(searchLower)
        const matchesNote = trade.journal_note?.toLowerCase().includes(searchLower) || false
        const matchesTags = trade.journal_tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ) || false

        if (!matchesSymbol && !matchesNote && !matchesTags) {
          return false
        }
      }

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

      // Tag filter
      if (filters.tag !== 'all') {
        if (!trade.journal_tags?.includes(filters.tag)) {
          return false
        }
      }

      return true
    })

    // Sorting logic
    if (sortField) {
      result.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortField) {
          case 'date':
            aValue = new Date(a.trade_date).getTime()
            bValue = new Date(b.trade_date).getTime()
            break
          case 'symbol':
            aValue = a.tradingsymbol.toLowerCase()
            bValue = b.tradingsymbol.toLowerCase()
            break
          case 'pnl':
            aValue = a.pnl || 0
            bValue = b.pnl || 0
            break
          case 'quantity':
            aValue = a.quantity
            bValue = b.quantity
            break
          case 'strategy':
            aValue = classifyTradeStrategy({
              ...a,
              product: a.product || 'MIS',
            })
            bValue = classifyTradeStrategy({
              ...b,
              product: b.product || 'MIS',
            })
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [trades, filters, sortField, sortDirection, debouncedSearch])

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
        note,
        tags,
      }),
    })

    setSelectedTrade(null)
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
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

          <ExportButton trades={filteredTrades} />
        </div>

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

        <StreakTracking trades={trades} />

        <TagAnalytics trades={filteredTrades} />

        <TimePatterns trades={filteredTrades} />

        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by symbol, notes, or tags..."
          />
          {debouncedSearch && (
            <p className="text-sm text-gray-400 mt-2">
              Searching for: <span className="text-emerald-400">"{debouncedSearch}"</span>
            </p>
          )}
        </div>

        <TradeFilters 
          onFilterChange={setFilters} 
          symbols={symbols}
          availableTags={availableTags}
        />

        <div className="bg-neutral-900 rounded-xl border border-gray-800 overflow-hidden">
          <TradesTable 
            trades={filteredTrades} 
            onTradeClick={setSelectedTrade}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>

        <TradeDetailDrawer
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onSave={handleSaveJournal}
        />
      </div>
    </div>
  )
}
