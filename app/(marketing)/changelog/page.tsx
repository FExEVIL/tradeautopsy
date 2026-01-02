'use client'

import { useState, useMemo } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { Search, Filter, ArrowUp, Sparkles, Rocket, Wrench, AlertTriangle } from 'lucide-react'
import { changelogData, changelogCategories, type ChangelogType, type ChangelogEntry } from '@/lib/data/changelog'
import { Logo } from '@/components/ui/Logo'

export default function ChangelogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ChangelogType | 'all'>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Filter changelog entries
  const filteredEntries = useMemo(() => {
    let filtered = changelogData

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(entry => entry.type === selectedType)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.items?.some(item => item.toLowerCase().includes(query)) ||
        entry.version?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [searchQuery, selectedType])

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getTypeIcon = (type: ChangelogType) => {
    switch (type) {
      case 'new':
        return <Sparkles className="w-4 h-4" />
      case 'improved':
        return <Rocket className="w-4 h-4" />
      case 'fixed':
        return <Wrench className="w-4 h-4" />
      case 'breaking':
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
              <Logo size="sm" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Changelog</h1>
          <p className="text-gray-400 text-lg">
            Stay up to date with the latest features, improvements, and fixes.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search changelog..."
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedType === 'all'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              All
            </button>
            {Object.entries(changelogCategories).map(([type, category]) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as ChangelogType)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  selectedType === type
                    ? `${category.color} border-current`
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Changelog Entries */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No entries found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEntries.map((entry) => {
              const isExpanded = expandedItems.has(entry.id)
              const category = changelogCategories[entry.type]
              const entryDate = new Date(entry.date)

              return (
                <div
                  key={entry.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                >
                  {/* Entry Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-lg border text-sm font-medium flex items-center gap-1.5 ${category.color}`}>
                          {getTypeIcon(entry.type)}
                          {category.label}
                        </span>
                        {entry.version && (
                          <span className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 text-sm font-mono">
                            v{entry.version}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">{entry.title}</h2>
                      <p className="text-gray-400 mb-3">{entry.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <time dateTime={entry.date}>
                          {format(entryDate, 'MMMM d, yyyy')}
                        </time>
                        {entry.link && (
                          <Link href={entry.link} className="text-emerald-400 hover:text-emerald-300">
                            Learn more →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Entry Items */}
                  {entry.items && entry.items.length > 0 && (
                    <div className="mt-4">
                      {isExpanded ? (
                        <ul className="space-y-2">
                          {entry.items.map((item, index) => (
                            <li key={index} className="flex items-start gap-3 text-gray-300">
                              <span className="text-emerald-400 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <span>{entry.items.length} {entry.items.length === 1 ? 'item' : 'items'}</span>
                          <span>•</span>
                          <button
                            onClick={() => toggleExpanded(entry.id)}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            Show details
                          </button>
                        </div>
                      )}
                      {isExpanded && (
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="mt-4 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          Hide details
                        </button>
                      )}
                    </div>
                  )}

                  {/* Image */}
                  {entry.image && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                      <img src={entry.image} alt={entry.title} className="w-full h-auto" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-gray-900/50 mt-12">
          <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
            <p>© 2025 TradeAutopsy. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link href="/help" className="hover:text-emerald-400 transition-colors">Help</Link>
              <span>•</span>
              <Link href="/changelog" className="hover:text-emerald-400 transition-colors font-medium">Changelog</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

