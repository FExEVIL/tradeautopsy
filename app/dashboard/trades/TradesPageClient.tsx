'use client'

import { useState, useMemo, useEffect } from 'react'
import { TradeFilters } from '../components/TradeFilters'
import { TradesTable } from '../components/TradesTable'
import TradeDetailDrawer from '../components/TradeDetailDrawer'
import { classifyTradeStrategy } from '@/lib/strategy-classifier'
import { Trade } from '@/types/trade'
import { ExportButton } from '../components/ExportButton'
import SearchBar from '../components/SearchBar'
import { useDebounce } from '@/lib/useDebounce'
import { PnLIndicator } from '@/components/PnLIndicator'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

const PAGE_SIZE = 50

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
  const [currentPage, setCurrentPage] = useState(1)
  
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
      // Search filter - only by symbol (no notes/tags search in All Trades)
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase()
        const matchesSymbol = trade.tradingsymbol.toLowerCase().includes(searchLower)
        if (!matchesSymbol) {
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

      // Profit/Loss filter
      if (filters.profitLoss !== 'all') {
        const pnl = trade.pnl || 0
        if (filters.profitLoss === 'profit' && pnl <= 0) return false
        if (filters.profitLoss === 'loss' && pnl >= 0) return false
      }

      // Symbol filter
      if (filters.symbol && trade.tradingsymbol !== filters.symbol) {
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

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / PAGE_SIZE)
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredTrades.slice(start, start + PAGE_SIZE)
  }, [filteredTrades, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, debouncedSearch])

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
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`/api/trades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note,
          tags,
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save journal entry')
      }

      setSelectedTrade(null)
      // Optionally show success message
    } catch (err) {
      console.error('Save journal error:', err)
      
      let errorMessage = 'Failed to save. Please try again.'
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('timeout') || err.message.includes('aborted')) {
          errorMessage = 'Request timed out. Please try again.'
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('network') || err.name === 'TypeError') {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else {
          errorMessage = err.message
        }
      }
      
      // Show error to user (you might want to add a toast notification here)
      alert(errorMessage)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
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

        {/* Simple Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0A0A0A] rounded-xl p-6 border border-white/5">
            <p className="text-gray-400 text-sm mb-2">Total P&L</p>
            <PnLIndicator value={stats.totalPnL} size="lg" />
          </div>
          <div className="bg-[#0A0A0A] rounded-xl p-6 border border-white/5">
            <p className="text-gray-400 text-sm mb-2">Win Rate</p>
            <p className="text-3xl font-bold text-white">
              {stats.winRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-[#0A0A0A] rounded-xl p-6 border border-white/5">
            <p className="text-gray-400 text-sm mb-2">Wins</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.wins}
            </p>
          </div>
          <div className="bg-[#0A0A0A] rounded-xl p-6 border border-white/5">
            <p className="text-gray-400 text-sm mb-2">Losses</p>
            <p className="text-3xl font-bold text-red-400">
              {stats.losses}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by symbol..."
          />
          {debouncedSearch && (
            <p className="text-sm text-gray-400">
              Searching for: <span className="text-emerald-400">"{debouncedSearch}"</span>
            </p>
          )}

          <TradeFilters 
            onFilterChange={setFilters} 
            symbols={symbols}
            availableTags={availableTags}
          />
        </div>

        {/* Trades Table */}
        <div className="bg-[#0F0F0F] rounded-xl border border-white/5 overflow-hidden">
          <TradesTable 
            trades={paginatedTrades} 
            onTradeClick={setSelectedTrade}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-[#0F0F0F] p-4 rounded-xl border border-white/5">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredTrades.length)} of {filteredTrades.length} trades
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-[#0A0A0A] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-[#0A0A0A] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <TradeDetailDrawer
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onSave={handleSaveJournal}
        />
      </div>
    </div>
  )
}
