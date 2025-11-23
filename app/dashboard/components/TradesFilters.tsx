'use client'

import { useState } from 'react'

interface FiltersState {
  search: string
  type: string
  strategy: string
  dateFrom: string
  dateTo: string
}

interface TradesFiltersProps {
  onFilterChange: (filters: FiltersState) => void
}

export function TradesFilters({ onFilterChange }: TradesFiltersProps) {
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    type: 'ALL',
    strategy: 'ALL',
    dateFrom: '',
    dateTo: ''
  })

  const updateFilter = (key: keyof FiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const cleared = {
      search: '',
      type: 'ALL',
      strategy: 'ALL',
      dateFrom: '',
      dateTo: ''
    }
    setFilters(cleared)
    onFilterChange(cleared)
  }

  const hasActiveFilters = filters.search || filters.type !== 'ALL' || filters.strategy !== 'ALL' || filters.dateFrom || filters.dateTo

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Search & Filter</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search Symbol */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Search Symbol</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="e.g. RELIANCE"
            className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 transition-colors"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Type</label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-gray-700 transition-colors"
          >
            <option value="ALL">All</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        {/* Strategy */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Strategy</label>
          <select
            value={filters.strategy}
            onChange={(e) => updateFilter('strategy', e.target.value)}
            className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-gray-700 transition-colors"
          >
            <option value="ALL">All</option>
            <option value="Intraday">Intraday</option>
            <option value="Delivery">Delivery</option>
            <option value="Swing">Swing</option>
            <option value="Options">Options</option>
          </select>
        </div>

        {/* From Date */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">From Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-gray-700 transition-colors"
            placeholder="dd/mm/yyyy"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">To Date</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-gray-700 transition-colors"
            placeholder="dd/mm/yyyy"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 text-xs text-gray-300 rounded-md">
              Symbol: {filters.search}
              <button onClick={() => updateFilter('search', '')} className="hover:text-white">×</button>
            </span>
          )}
          {filters.type !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 text-xs text-gray-300 rounded-md">
              Type: {filters.type}
              <button onClick={() => updateFilter('type', 'ALL')} className="hover:text-white">×</button>
            </span>
          )}
          {filters.strategy !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 text-xs text-gray-300 rounded-md">
              Strategy: {filters.strategy}
              <button onClick={() => updateFilter('strategy', 'ALL')} className="hover:text-white">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}