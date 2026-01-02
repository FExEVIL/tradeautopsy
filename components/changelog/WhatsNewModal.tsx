'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { changelogData } from '@/lib/data/changelog'
import { format } from 'date-fns'
import Link from 'next/link'

interface WhatsNewModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
  const [hasSeenLatest, setHasSeenLatest] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    // Get the latest entry date
    const latestEntry = changelogData[0]
    const lastSeenDate = localStorage.getItem('changelog_last_seen')
    
    if (lastSeenDate === latestEntry.date) {
      setHasSeenLatest(true)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Get entries from the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentEntries = changelogData.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate >= sevenDaysAgo
  })

  const handleClose = () => {
    // Mark latest entry as seen
    if (recentEntries.length > 0) {
      localStorage.setItem('changelog_last_seen', recentEntries[0].date)
    }
    onClose()
  }

  if (recentEntries.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">What's New</h2>
              <p className="text-sm text-gray-400">Recent updates and improvements</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {recentEntries.map((entry) => {
            const entryDate = new Date(entry.date)
            const category = entry.type === 'new' ? 'text-emerald-400' : 
                           entry.type === 'improved' ? 'text-blue-400' :
                           entry.type === 'fixed' ? 'text-yellow-400' : 'text-red-400'

            return (
              <div key={entry.id} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-medium ${category} uppercase`}>
                    {entry.type}
                  </span>
                  {entry.version && (
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-xs font-mono">
                      v{entry.version}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {format(entryDate, 'MMM d, yyyy')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{entry.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{entry.description}</p>
                {entry.items && entry.items.length > 0 && (
                  <ul className="space-y-1.5">
                    {entry.items.slice(0, 5).map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                    {entry.items.length > 5 && (
                      <li className="text-xs text-gray-500 pl-4">
                        +{entry.items.length - 5} more items
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <Link
              href="/changelog"
              className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
            >
              View full changelog →
            </Link>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

