'use client'

import { useState, useEffect } from 'react'
import { Mic, X } from 'lucide-react'
import { AudioRecorder, type AudioJournalData } from '@/components/AudioRecorder'
import { createClient } from '@/utils/supabase/client'

interface Trade {
  id: string
  symbol: string
  tradingsymbol: string
  trade_date: string
  trade_type: string
  transaction_type: string
  pnl: number | null
}

export function AudioRecordModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTradeId, setSelectedTradeId] = useState<string>('')
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchRecentTrades = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: tradesData, error } = await supabase
        .from('trades')
        .select('id, symbol, tradingsymbol, trade_date, trade_type, transaction_type, pnl')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('trade_date', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching trades:', error)
      } else {
        setTrades(tradesData || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    fetchRecentTrades()
    setIsOpen(true)
  }

  const handleSave = async (audioData: AudioJournalData) => {
    if (!selectedTradeId) {
      alert('Please select a trade first')
      return
    }

    try {
      const formData = new FormData()
      formData.append('audio', audioData.audioBlob)
      formData.append('trade_id', selectedTradeId)
      formData.append('transcript', audioData.transcript)
      formData.append('summary', audioData.summary)
      formData.append('duration', audioData.duration.toString())
      formData.append('emotions', JSON.stringify(audioData.emotions))
      formData.append('insights', JSON.stringify(audioData.insights))
      formData.append('tags', JSON.stringify(audioData.tags))

      const response = await fetch('/api/audio-journal/save', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save audio journal')
      }

      // Close modal and refresh page
      setIsOpen(false)
      setSelectedTradeId('')
      window.location.reload()
    } catch (error: any) {
      alert('Error saving audio journal: ' + (error.message || 'Unknown error'))
      console.error('Save error:', error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
      >
        <Mic className="w-4 h-4" />
        <span>Record Audio</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Record Audio Journal</h2>
          <button
            onClick={() => {
              setIsOpen(false)
              setSelectedTradeId('')
            }}
            className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trade Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Select Trade
            </label>
            {loading ? (
              <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400">
                Loading trades...
              </div>
            ) : (
              <select
                value={selectedTradeId}
                onChange={(e) => setSelectedTradeId(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="">Choose a trade...</option>
                {trades.map((trade) => {
                  const symbol = trade.symbol || trade.tradingsymbol || 'UNKNOWN'
                  const tradeType = trade.trade_type || trade.transaction_type || 'BUY'
                  const pnl = trade.pnl || 0
                  const date = new Date(trade.trade_date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                  })
                  
                  return (
                    <option key={trade.id} value={trade.id}>
                      {symbol} • {date} • {tradeType} • {pnl >= 0 ? '+' : ''}₹{Math.abs(pnl).toFixed(2)}
                    </option>
                  )
                })}
              </select>
            )}
          </div>

          {/* Audio Recorder */}
          {selectedTradeId && (
            <AudioRecorder
              tradeId={selectedTradeId}
              onSave={handleSave}
            />
          )}

          {!selectedTradeId && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Select a trade above to start recording
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
