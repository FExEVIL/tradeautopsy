'use client'

import { Search, X } from 'lucide-react'
import type { FilterState } from '@/lib/behavioral/types'

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onReset: () => void
}

export default function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  return (
    <div className="bg-[#262628] border border-[#3F3F46] rounded-xl p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search symbols, notes, tags..."
            className="w-full bg-[#1F2123] border border-[#3F3F46] rounded-lg pl-10 pr-4 py-2 text-sm
                       text-gray-100 placeholder:text-gray-500
                       focus:ring-2 focus:ring-[#32B8C6] focus:border-transparent"
          />
        </div>

        <select
          value={filters.winLoss}
          onChange={(e) => onChange({ ...filters, winLoss: e.target.value as any })}
          className="bg-[#1F2123] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-gray-100
                     focus:ring-2 focus:ring-[#32B8C6] focus:border-transparent"
        >
          <option value="all">All trades</option>
          <option value="wins">Winning only</option>
          <option value="losses">Losing only</option>
          <option value="breakeven">Breakeven</option>
        </select>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-[#1F2123] border border-[#3F3F46] rounded-lg
                     hover:border-[#32B8C6] transition-colors text-sm text-gray-200"
        >
          <X className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}
