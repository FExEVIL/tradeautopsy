'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Eye, TrendingUp, TrendingDown, X, Save, GripVertical } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { motion, AnimatePresence } from 'framer-motion'

interface WatchlistItem {
  id?: string
  symbol: string
  notes?: string
  support_levels?: number[]
  resistance_levels?: number[]
  tags?: string[]
  order_index?: number
}

interface Watchlist {
  id: string
  name: string
  description?: string
  watchlist_items?: WatchlistItem[]
}

interface WatchlistClientProps {
  initialWatchlists: Watchlist[]
}

export function WatchlistClient({ initialWatchlists }: WatchlistClientProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>(initialWatchlists)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddSymbolModal, setShowAddSymbolModal] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<{ watchlistId: string; itemId?: string } | null>(null)

  const handleCreateWatchlist = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (response.ok) {
        const data = await response.json()
        setWatchlists([...watchlists, data.watchlist])
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Failed to create watchlist:', error)
    }
  }

  const handleAddSymbol = async (watchlistId: string, symbol: string, notes?: string) => {
    try {
      const response = await fetch(`/api/watchlist/${watchlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, notes }),
      })

      if (response.ok) {
        const data = await response.json()
        setWatchlists(watchlists.map(wl =>
          wl.id === watchlistId
            ? { ...wl, watchlist_items: [...(wl.watchlist_items || []), data.item] }
            : wl
        ))
        setShowAddSymbolModal(null)
      }
    } catch (error) {
      console.error('Failed to add symbol:', error)
    }
  }

  const handleDeleteWatchlist = async (id: string) => {
    if (!confirm('Delete this watchlist? All symbols will be removed.')) return

    try {
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWatchlists(watchlists.filter(wl => wl.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete watchlist:', error)
    }
  }

  const handleDeleteItem = async (watchlistId: string, itemId: string) => {
    try {
      const response = await fetch(`/api/watchlist/${watchlistId}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWatchlists(watchlists.map(wl =>
          wl.id === watchlistId
            ? { ...wl, watchlist_items: (wl.watchlist_items || []).filter(item => item.id !== itemId) }
            : wl
        ))
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  if (watchlists.length === 0) {
    return (
      <EmptyState
        icon={Eye}
        title="No watchlists yet"
        description="Create a watchlist to track your favorite symbols and key levels"
        primaryAction={{
          label: "Create Watchlist",
          onClick: () => setShowAddModal(true),
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Your Watchlists</h2>
          <p className="text-gray-400 text-sm">Track symbols and key levels</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          New Watchlist
        </button>
      </div>

      {/* Watchlists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {watchlists.map((watchlist) => (
          <WatchlistCard
            key={watchlist.id}
            watchlist={watchlist}
            onAddSymbol={() => setShowAddSymbolModal(watchlist.id)}
            onDeleteWatchlist={() => handleDeleteWatchlist(watchlist.id)}
            onDeleteItem={(itemId) => handleDeleteItem(watchlist.id, itemId)}
          />
        ))}
      </div>

      {/* Add Watchlist Modal */}
      {showAddModal && (
        <AddWatchlistModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateWatchlist}
        />
      )}

      {/* Add Symbol Modal */}
      {showAddSymbolModal && (
        <AddSymbolModal
          watchlistId={showAddSymbolModal}
          onClose={() => setShowAddSymbolModal(null)}
          onSubmit={handleAddSymbol}
        />
      )}
    </div>
  )
}

function WatchlistCard({
  watchlist,
  onAddSymbol,
  onDeleteWatchlist,
  onDeleteItem,
}: {
  watchlist: Watchlist
  onAddSymbol: () => void
  onDeleteWatchlist: () => void
  onDeleteItem: (itemId: string) => void
}) {
  const items = watchlist.watchlist_items || []

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{watchlist.name}</h3>
          {watchlist.description && (
            <p className="text-gray-400 text-sm">{watchlist.description}</p>
          )}
        </div>
        <button
          onClick={onDeleteWatchlist}
          className="text-gray-500 hover:text-red-400 transition-colors p-1"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No symbols yet</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{item.symbol}</span>
                  {item.support_levels && item.support_levels.length > 0 && (
                    <span className="text-xs text-emerald-400">
                      S: {item.support_levels.join(', ')}
                    </span>
                  )}
                  {item.resistance_levels && item.resistance_levels.length > 0 && (
                    <span className="text-xs text-red-400">
                      R: {item.resistance_levels.join(', ')}
                    </span>
                  )}
                </div>
                {item.notes && (
                  <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.location.href = `/dashboard/manual?symbol=${item.symbol}`}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
                  title="Add Trade"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => item.id && onDeleteItem(item.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Symbol Button */}
      <button
        onClick={onAddSymbol}
        className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <Plus size={16} />
        Add Symbol
      </button>
    </div>
  )
}

function AddWatchlistModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (name: string, description?: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Create Watchlist</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Nifty 50, Swing Candidates"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onSubmit(name.trim(), description.trim() || undefined)
              }
            }}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

function AddSymbolModal({
  watchlistId,
  onClose,
  onSubmit,
}: {
  watchlistId: string
  onClose: () => void
  onSubmit: (watchlistId: string, symbol: string, notes?: string) => void
}) {
  const [symbol, setSymbol] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Add Symbol</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., RELIANCE, NIFTY, BANKNIFTY"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Entry criteria, setup, etc."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (symbol.trim()) {
                onSubmit(watchlistId, symbol.trim(), notes.trim() || undefined)
              }
            }}
            disabled={!symbol.trim()}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

