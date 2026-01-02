'use client'

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { changelogData } from '@/lib/data/changelog'
import { WhatsNewModal } from './WhatsNewModal'

export function ChangelogBadge() {
  const [hasNewUpdates, setHasNewUpdates] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Check if there are new updates since last seen
    const lastSeenDate = localStorage.getItem('changelog_last_seen')
    if (!lastSeenDate) {
      // First time - show badge but don't auto-open
      setHasNewUpdates(true)
      return
    }

    // Get the latest entry date
    const latestEntry = changelogData[0]
    if (latestEntry && latestEntry.date > lastSeenDate) {
      setHasNewUpdates(true)
    }
  }, [])

  if (!hasNewUpdates) return null

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
        aria-label="What's new"
      >
        <Sparkles className="w-4 h-4" />
        <span>What's New</span>
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      </button>
      <WhatsNewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

