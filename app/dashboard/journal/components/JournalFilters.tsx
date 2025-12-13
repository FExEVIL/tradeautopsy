'use client'

import { useRouter, usePathname } from 'next/navigation'

interface JournalFiltersProps {
  currentFilter: string
  currentJournaled: string
}

export function JournalFilters({ currentFilter, currentJournaled }: JournalFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams()
    
    if (key === 'filter') {
      if (value !== 'all') {
        params.set('filter', value)
      }
      if (currentJournaled !== 'all') {
        params.set('journaled', currentJournaled)
      }
    } else if (key === 'journaled') {
      if (currentFilter !== 'all') {
        params.set('filter', currentFilter)
      }
      if (value !== 'all') {
        params.set('journaled', value)
      }
    }
    
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const pillClass = (isActive: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-green-500 text-black'
        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
    }`

  return (
    <div className="flex items-center gap-3">
      {/* P&L Filters */}
      <button
        onClick={() => updateFilter('filter', 'all')}
        className={pillClass(currentFilter === 'all')}
      >
        ALL
      </button>
      <button
        onClick={() => updateFilter('filter', 'win')}
        className={pillClass(currentFilter === 'win')}
      >
        WIN
      </button>
      <button
        onClick={() => updateFilter('filter', 'loss')}
        className={pillClass(currentFilter === 'loss')}
      >
        LOSS
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10" />

      {/* Journal Filters */}
      <button
        onClick={() => updateFilter('journaled', 'all')}
        className={pillClass(currentJournaled === 'all')}
      >
        All
      </button>
      <button
        onClick={() => updateFilter('journaled', 'journaled')}
        className={pillClass(currentJournaled === 'journaled')}
      >
        Journaled
      </button>
      <button
        onClick={() => updateFilter('journaled', 'not-journaled')}
        className={pillClass(currentJournaled === 'not-journaled')}
      >
        Not Journaled
      </button>
    </div>
  )
}
