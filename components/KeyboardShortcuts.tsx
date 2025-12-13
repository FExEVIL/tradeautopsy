'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Keyboard } from 'lucide-react'

interface Shortcut {
  key: string
  description: string
  action: () => void
}

export function KeyboardShortcuts() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const shortcuts: Shortcut[] = [
    {
      key: 'J',
      description: 'Open Journal',
      action: () => router.push('/dashboard/journal'),
    },
    {
      key: 'C',
      description: 'Open Calendar',
      action: () => router.push('/dashboard/calendar'),
    },
    {
      key: 'T',
      description: 'View All Trades',
      action: () => router.push('/dashboard/trades'),
    },
    {
      key: 'D',
      description: 'Go to Dashboard',
      action: () => router.push('/dashboard'),
    },
    {
      key: 'E',
      description: 'Export Trades',
      action: () => {
        // Trigger export - this would need to be passed as a prop or use context
        const event = new KeyboardEvent('keydown', { key: 'e', ctrlKey: true })
        window.dispatchEvent(event)
      },
    },
    {
      key: '?',
      description: 'Show Keyboard Shortcuts',
      action: () => setShowModal(true),
    },
  ]

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      // Check for Ctrl/Cmd + key combinations
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault()
          // Export functionality would be handled by the component that has export button
        }
        return
      }

      // Regular key shortcuts
      if (e.key.toLowerCase() === 'j') {
        e.preventDefault()
        router.push('/dashboard/journal')
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault()
        router.push('/dashboard/calendar')
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault()
        router.push('/dashboard/trades')
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault()
        router.push('/dashboard')
      }

      // Special case for ? key
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault()
        setShowModal(true)
      }

      // Escape to close modal
      if (e.key === 'Escape' && showModal) {
        setShowModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [router, showModal])

  return (
    <>
      {/* Keyboard Shortcuts Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-neutral-900 border border-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Keyboard className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                  <span className="text-gray-300">{shortcut.description}</span>
                  <kbd className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono text-white">
                    {shortcut.key === 'E' ? 'Ctrl + E' : shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-sm text-gray-400 text-center">
                Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Esc</kbd> to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

