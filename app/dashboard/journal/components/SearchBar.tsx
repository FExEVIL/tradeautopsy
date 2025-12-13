'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useDebounce } from '@/lib/useDebounce'

export function SearchBar({ initialValue = '' }: { initialValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }

    // Preserve other filters
    const filter = searchParams.get('filter')
    const journaled = searchParams.get('journaled')
    
    if (filter) params.set('filter', filter)
    if (journaled) params.set('journaled', journaled)

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }, [debouncedSearch, pathname, router, searchParams])

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search symbol, setup, or notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 transition text-white placeholder-gray-500"
      />
    </div>
  )
}
