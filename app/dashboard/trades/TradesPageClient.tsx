'use client'

import { useState, useMemo } from 'react'
import { TradeFilters } from '../components/TradeFilters'
import { TradesTable } from '../components/TradesTable'
import { classifyTradeStrategy } from '@/lib/strategy-classifier'

interface Trade {
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
}

interface FilterState {
  dateFrom: string
  dateTo: string
  symbol: string
  profitLoss: 'all' | 'profit' | 'loss'
  strategy: 'all' | 'Intraday' | 'Delivery' | 'Swing' | 'Options'
}

export default function TradesPageClient({ trades }: { trades: Trade[] }) {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    symbol: '',
    profitLoss: 'all',
    strategy: 'all'
  })

  // Get unique symbols for filter dropdown
  const symbols = useMemo(() => {
const uniqueSymbols = Array.from(new Set(trades.map(t => t.tradingsymbol))).sort()

    return uniqueSymbols
  }, [trades])

  // Apply filters
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      // Date From filter
      if (filters.dateFrom && new Date(trade.trade_date) < new Date(filters.dateFrom)) {
        return false
      }

      // Date To filter
      if (filters.dateTo && new Date(trade.trade_date) > new Date(filters.dateTo)) {
        return false
      }

      // Symbol filter
      if (filters.symbol && trade.tradingsymbol !== filters.symbol) {
        return false
      }

      // Profit/Loss filter
      if (filters.profitLoss === 'profit' && (trade.pnl || 0) <= 0) {
        return false
      }
      if (filters.profitLoss === 'loss' && (trade.pnl || 0) >= 0) {
        return false
      }

      // Strategy filter
      if (filters.strategy !== 'all') {
        const tradeStrategy = classifyTradeStrategy({ 
          ...trade, 
          product: trade.product || 'MIS' 
        })
        if (tradeStrategy !== filters.strategy) {
          return false
        }
      }

      return true
    })
  }, [trades, filters])

  // Calculate stats for filtered trades
  const stats = useMemo(() => {
    const totalPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const wins = filteredTrades.filter(t => (t.pnl || 0) > 0).length
    const losses = filteredTrades.filter(t => (t.pnl || 0) < 0).length
    const winRate = filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0

    return { totalPnL, wins, losses, winRate, total: filteredTrades.length }
  }, [filteredTrades])

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">All Trades</h1>
          <p className="text-gray-400">
            {stats.total} {stats.total === 1 ? 'trade' : 'trades'} 
            {trades.length !== stats.total && ` (filtered from ${trades.length})`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Total P&L</p>
            <p className={`text-3xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.totalPnL >= 0 ? '+' : ''}₹{stats.totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Win Rate</p>
            <p className="text-3xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Wins</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.wins}</p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Losses</p>
            <p className="text-3xl font-bold text-red-400">{stats.losses}</p>
          </div>
        </div>

        {/* Filters */}
        <TradeFilters onFilterChange={setFilters} symbols={symbols} />

        {/* Trades Table */}
        <div className="bg-neutral-900 rounded-xl border border-gray-800 overflow-hidden">
          <TradesTable trades={filteredTrades} />
        </div>
      </div>
    </div>
  )
}
