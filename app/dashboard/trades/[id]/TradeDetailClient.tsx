'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Trade {
  id: string
  tradingsymbol: string
  side: string
  entry_price: number
  exit_price?: number
  quantity: number
  pnl?: number
  status: string
  trade_date: string
  notes?: string
}

export function TradeDetailClient({ trade }: { trade: Trade }) {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(trade.notes || '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSaveNotes() {
    setSaving(true)
    const { error } = await supabase
      .from('trades')
      .update({ notes })
      .eq('id', trade.id)

    if (error) {
      alert('Error saving notes')
    } else {
      alert('Notes saved!')
      setEditing(false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this trade?')) return

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', trade.id)

    if (error) {
      alert('Error deleting trade')
    } else {
      alert('Trade deleted!')
      router.push('/dashboard/trades')
    }
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            ← Back
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30"
          >
            Delete Trade
          </button>
        </div>

        {/* Trade Details Card */}
        <div className="bg-neutral-900 rounded-xl p-8 border border-gray-800 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{trade.tradingsymbol}</h1>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                trade.side === 'LONG' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {trade.side}
              </span>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm mb-1">P&L</p>
              <p className={`text-3xl font-bold ${
                (trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {(trade.pnl || 0) >= 0 ? '+' : ''}₹{(trade.pnl || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Entry Price</p>
              <p className="text-white text-lg font-semibold">₹{trade.entry_price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Exit Price</p>
              <p className="text-white text-lg font-semibold">
                {trade.exit_price ? `₹${trade.exit_price.toFixed(2)}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Quantity</p>
              <p className="text-white text-lg font-semibold">{trade.quantity}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className={`text-lg font-semibold ${
                trade.status === 'OPEN' ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {trade.status}
              </p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-neutral-900 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Trade Notes</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-neutral-950 border border-gray-700 rounded-lg p-4 text-white min-h-32 focus:outline-none focus:border-emerald-500"
                placeholder="Add your trade notes here..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setNotes(trade.notes || '')
                  }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-300">
              {notes || 'No notes added yet. Click Edit to add notes.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
