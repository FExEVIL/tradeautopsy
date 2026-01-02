'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Search,
  X,
  TrendingUp,
  BookOpen,
  Target,
  FileText,
  Calendar,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'

interface SearchResult {
  id: string
  type: 'trade' | 'journal' | 'goal' | 'plan'
  title: string
  subtitle?: string
  metadata?: string
  href: string
  icon: any
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
        setResults([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Search handler
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const searchResults: SearchResult[] = []

      // Search trades
      const { data: trades } = await supabase
        .from('trades')
        .select('id, symbol, tradingsymbol, trade_date, pnl, strategy, notes')
        .eq('user_id', user.id)
        .or(`symbol.ilike.%${searchQuery}%,tradingsymbol.ilike.%${searchQuery}%,strategy.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`)
        .order('trade_date', { ascending: false })
        .limit(5)

      if (trades) {
        trades.forEach((trade) => {
          searchResults.push({
            id: trade.id,
            type: 'trade',
            title: trade.symbol || trade.tradingsymbol || 'Trade',
            subtitle: trade.strategy || undefined,
            metadata: trade.pnl
              ? `₹${Number(trade.pnl).toLocaleString()} • ${format(new Date(trade.trade_date), 'MMM d, yyyy')}`
              : format(new Date(trade.trade_date), 'MMM d, yyyy'),
            href: `/dashboard/trades/${trade.id}`,
            icon: TrendingUp,
          })
        })
      }

      // Search journal entries
      const { data: journalEntries } = await supabase
        .from('journal_entries')
        .select('id, title, content, created_at')
        .eq('user_id', user.id)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(5)

      if (journalEntries) {
        journalEntries.forEach((entry) => {
          searchResults.push({
            id: entry.id,
            type: 'journal',
            title: entry.title || 'Journal Entry',
            subtitle: entry.content?.substring(0, 100) || undefined,
            metadata: format(new Date(entry.created_at), 'MMM d, yyyy'),
            href: `/dashboard/journal?entry=${entry.id}`,
            icon: BookOpen,
          })
        })
      }

      // Search goals
      const { data: goals } = await supabase
        .from('goals')
        .select('id, title, goal_type, target_value, current_value, deadline, completed')
        .eq('user_id', user.id)
        .ilike('title', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(5)

      if (goals) {
        goals.forEach((goal) => {
          const progress = goal.target_value
            ? `${Math.round((Number(goal.current_value || 0) / Number(goal.target_value)) * 100)}%`
            : undefined
          searchResults.push({
            id: goal.id,
            type: 'goal',
            title: goal.title,
            subtitle: goal.goal_type ? goal.goal_type.replace('_', ' ') : undefined,
            metadata: progress
              ? `${progress} • ${goal.completed ? 'Completed' : 'Active'}`
              : goal.completed
              ? 'Completed'
              : 'Active',
            href: `/dashboard/goals?goal=${goal.id}`,
            icon: Target,
          })
        })
      }

      // Search daily trade plans
      const { data: plans } = await supabase
        .from('daily_trade_plans')
        .select('id, plan_date, market_sentiment, trading_plan, completed')
        .eq('user_id', user.id)
        .or(`market_notes.ilike.%${searchQuery}%,trading_plan.ilike.%${searchQuery}%,eod_review.ilike.%${searchQuery}%`)
        .order('plan_date', { ascending: false })
        .limit(5)

      if (plans) {
        plans.forEach((plan) => {
          searchResults.push({
            id: plan.id,
            type: 'plan',
            title: `Trade Plan - ${format(new Date(plan.plan_date), 'MMM d, yyyy')}`,
            subtitle: plan.market_sentiment ? `Sentiment: ${plan.market_sentiment}` : undefined,
            metadata: plan.completed ? 'Completed' : 'Active',
            href: `/dashboard/daily-plan?date=${plan.plan_date}`,
            icon: Calendar,
          })
        })
      }

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        router.push(results[selectedIndex].href)
        setIsOpen(false)
        setQuery('')
        setResults([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, router])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-start justify-center pt-[20vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false)
          setQuery('')
          setResults([])
        }
      }}
    >
      <div className="w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trades, journal, goals, plans..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  setResults([])
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
              ⌘K
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => {
                  const Icon = result.icon
                  const isSelected = index === selectedIndex

                  return (
                    <button
                      key={result.id}
                      onClick={() => {
                        router.push(result.href)
                        setIsOpen(false)
                        setQuery('')
                        setResults([])
                      }}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/20 border-l-2 border-emerald-500'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      <div className={`mt-1 ${isSelected ? 'text-emerald-400' : 'text-gray-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {result.title}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400 uppercase">
                            {result.type}
                          </span>
                        </div>
                        {result.subtitle && (
                          <p className="text-sm text-gray-400 truncate">{result.subtitle}</p>
                        )}
                        {result.metadata && (
                          <p className="text-xs text-gray-500 mt-1">{result.metadata}</p>
                        )}
                      </div>
                      <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-gray-600'}`} />
                    </button>
                  )
                })}
              </div>
            ) : query.trim() ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p>No results found</p>
                <p className="text-sm mt-1">Try searching for trades, journal entries, goals, or plans</p>
              </div>
            ) : (
              <div className="py-8 px-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: TrendingUp, label: 'Trades', color: 'text-green-400' },
                    { icon: BookOpen, label: 'Journal', color: 'text-blue-400' },
                    { icon: Target, label: 'Goals', color: 'text-purple-400' },
                    { icon: Calendar, label: 'Plans', color: 'text-emerald-400' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="text-sm text-gray-300">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Start typing to search across all your data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

