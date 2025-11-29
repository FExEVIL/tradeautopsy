'use client'

import { useState, useEffect } from 'react'
import { X, Tag, Save } from 'lucide-react'

interface Trade {
  id: string
  tradingsymbol: string
  transaction_type: string
  quantity: number
  average_price?: number
  trade_date: string
  pnl: number | null
  product?: string
  journal_note?: string
  journal_tags?: string[]
}

interface TradeDetailDrawerProps {
  trade: Trade | null
  onClose: () => void
  onSave: (id: string, note: string, tags: string[]) => Promise<void>
}

export default function TradeDetailDrawer({
  trade,
  onClose,
  onSave,
}: TradeDetailDrawerProps) {
  const [note, setNote] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  // sync local state when trade changes
  useEffect(() => {
    if (trade) {
      setNote(trade.journal_note || '')
      setTags(trade.journal_tags || [])
    } else {
      setNote('')
      setTags([])
    }
  }, [trade])

  if (!trade) return null

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const value = tagInput.trim()
      if (!tags.includes(value)) {
        setTags([...tags, value])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSave = async () => {
    setSaving(true)
    await onSave(trade.id, note, tags)
    setSaving(false)
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-neutral-900 border-l border-gray-800 z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {trade.tradingsymbol}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(trade.trade_date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Type</p>
                <p
                  className={`font-medium ${
                    trade.transaction_type === 'buy'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {trade.transaction_type?.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Quantity</p>
                <p className="text-white font-medium">{trade.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Price</p>
                <p className="text-white font-medium">
                  ₹{(trade.average_price || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">P&L</p>
                <p
                  className={`font-bold ${
                    (trade.pnl || 0) >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {(trade.pnl || 0) >= 0 ? '+' : ''}₹
                  {(trade.pnl || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Journal Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none resize-none"
              placeholder="What was your plan? How did you feel? What did you learn?"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-md border border-emerald-500/20"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-emerald-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type tag and press Enter (e.g., FOMO, Plan follow, Revenge)"
              className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Journal'}
          </button>
        </div>
      </div>
    </>
  )
}
