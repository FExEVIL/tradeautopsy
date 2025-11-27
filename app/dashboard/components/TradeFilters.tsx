'use client'

import { useState } from 'react'

interface FilterState {
  dateFrom: string
  dateTo: string
  symbol: string
  profitLoss: 'all' | 'profit' | 'loss'
  strategy: 'all' | 'Intraday' | 'Delivery' | 'Swing' | 'Options'
}

interface TradeFiltersProps {
  onFilterChange: (filters: FilterState) => void
  symbols: string[]
}

export function TradeFilters({ onFilterChange, symbols }: TradeFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    symbol: '',
    profitLoss: 'all',
    strategy: 'all'
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      dateFrom: '',
      dateTo: '',
      symbol: '',
      profitLoss: 'all',
      strategy: 'all'
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'profitLoss' || key === 'strategy') return value !== 'all'
    return value !== ''
  }).length

  return (
    <div className="bg-neutral-900 rounded-xl border border-gray-800 mb-6">
      {/* Filter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          <span className="font-semibold text-white">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full bg-neutral-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full bg-neutral-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Symbol */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Symbol</label>
              <select
                value={filters.symbol}
                onChange={(e) => handleFilterChange('symbol', e.target.value)}
                className="w-full bg-neutral-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Symbols</option>
                {symbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>

            {/* Profit/Loss */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">P&L Filter</label>
              <select
                value={filters.profitLoss}
                onChange={(e) => handleFilterChange('profitLoss', e.target.value as any)}
                className="w-full bg-neutral-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Trades</option>
                <option value="profit">Profitable Only</option>
                <option value="loss">Losses Only</option>
              </select>
            </div>

            {/* Strategy */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Strategy</label>
              <select
                value={filters.strategy}
                onChange={(e) => handleFilterChange('strategy', e.target.value as any)}
                className="w-full bg-neutral-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Strategies</option>
                <option value="Intraday">Intraday</option>
                <option value="Delivery">Delivery</option>
                <option value="Swing">Swing</option>
                <option value="Options">Options</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="w-full bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
