'use client'

import { useState, useMemo } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Search, ChevronDown, ChevronUp, HelpCircle, Mail, MessageSquare } from 'lucide-react'
import { faqData, faqCategories, type FAQItem } from '@/lib/data/faqData'
import { Logo } from '@/components/ui/Logo'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [helpfulFeedback, setHelpfulFeedback] = useState<Map<string, boolean>>(new Map())

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let filtered = faqData

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(faq => faq.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [searchQuery, selectedCategory])

  // Group FAQs by category
  const faqsByCategory = useMemo(() => {
    const grouped: Record<string, FAQItem[]> = {}
    filteredFAQs.forEach(faq => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = []
      }
      grouped[faq.category].push(faq)
    })
    return grouped
  }, [filteredFAQs])

  const toggleItem = (id: string) => {
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

  const toggleExpandAll = () => {
    if (expandedItems.size === filteredFAQs.length) {
      setExpandedItems(new Set())
    } else {
      setExpandedItems(new Set(filteredFAQs.map(faq => faq.id)))
    }
  }

  const handleHelpful = (id: string, helpful: boolean) => {
    setHelpfulFeedback(prev => {
      const next = new Map(prev)
      next.set(id, helpful)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-4">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold">Help & FAQ</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Categories
            </button>
            {faqCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Expand/Collapse All */}
        {filteredFAQs.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'} found
            </p>
            <button
              onClick={toggleExpandAll}
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              {expandedItems.size === filteredFAQs.length ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        )}

        {/* FAQ Items */}
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or category filter
            </p>
            <Link
              href="/help"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(faqsByCategory).map(([category, faqs]) => (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">{category}</h2>
                <div className="space-y-3">
                  {faqs.map(faq => {
                    const isExpanded = expandedItems.has(faq.id)
                    const wasHelpful = helpfulFeedback.get(faq.id)

                    return (
                      <div
                        key={faq.id}
                        className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
                        >
                          <span className="text-white font-medium pr-4">{faq.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-6 py-4 border-t border-gray-800">
                            <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-line">
                              {faq.answer}
                            </p>

                            {/* Helpful Feedback */}
                            {wasHelpful === undefined && (
                              <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                                <span className="text-sm text-gray-400">Was this helpful?</span>
                                <button
                                  onClick={() => handleHelpful(faq.id, true)}
                                  className="px-4 py-2 text-sm bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => handleHelpful(faq.id, false)}
                                  className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            )}

                            {wasHelpful !== undefined && (
                              <div className="pt-4 border-t border-gray-800">
                                <p className="text-sm text-emerald-400">
                                  {wasHelpful ? '✓ Thanks for your feedback!' : 'We\'ll improve this answer.'}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
            <MessageSquare className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Still need help?</h3>
            <p className="text-gray-400 mb-6">
              Can't find what you're looking for? Contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@tradeautopsy.in"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                Email Support
              </a>
              <Link
                href="/feedback"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                Send Feedback
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
          <p>© 2024 TradeAutopsy. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-emerald-400 transition-colors">Help</Link>
            <span>•</span>
            <Link href="/changelog" className="hover:text-emerald-400 transition-colors">Changelog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

