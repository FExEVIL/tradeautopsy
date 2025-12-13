'use client'

import { useState } from 'react'
import { AudioPlayer } from '@/components/AudioPlayer'
import { 
  Mic, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
// Using native Date formatting instead of date-fns

interface AudioJournalEntry {
  id: string
  audio_url: string
  transcript: string
  summary: string
  duration: number
  emotions: string[]
  insights: string[]
  tags: string[]
  created_at: string
}

interface Trade {
  id: string
  symbol: string
  tradingsymbol: string
  trade_date: string
  trade_type: string
  transaction_type: string
  quantity: number
  price: number
  average_price: number
  pnl: number | null
  strategy: string
  notes: string | null
  emotions: string[] | null
  tags: string[] | null
  has_audio_journal: boolean
  audio_journal_entries?: AudioJournalEntry[]
}

interface JournalCardProps {
  trade: Trade
}

export function JournalCard({ trade }: JournalCardProps) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  const audioEntry = trade.audio_journal_entries?.[0]
  const isProfitable = (trade.pnl || 0) > 0
  const symbol = trade.symbol || trade.tradingsymbol || 'UNKNOWN'
  const tradeType = (trade.trade_type || trade.transaction_type || 'BUY').toUpperCase()
  const price = trade.price || trade.average_price || 0

  const formatPnL = (pnl: number | null) => {
    if (pnl === null) return '₹0'
    const formatted = Math.abs(pnl).toFixed(2)
    return `${pnl >= 0 ? '+' : '-'}₹${formatted}`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-white">{symbol}</h3>
              
              {/* Trade Type Badge */}
              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                tradeType === 'BUY' || tradeType === 'LONG'
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {tradeType}
              </span>

              {/* Strategy Badge */}
              {trade.strategy && (
                <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                  {trade.strategy}
                </span>
              )}

              {/* Audio Badge */}
              {audioEntry && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                  <Mic className="w-3 h-3" />
                  <span>{formatDuration(audioEntry.duration)}</span>
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(trade.trade_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              
              <div className="flex items-center gap-1">
                {isProfitable ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={isProfitable ? 'text-green-400' : 'text-red-400'}>
                  {formatPnL(trade.pnl)}
                </span>
              </div>

              <span>{trade.quantity} qty @ ₹{price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Audio Player */}
        {audioEntry && (
          <div>
            <AudioPlayer
              audioUrl={audioEntry.audio_url}
              transcript={audioEntry.transcript}
              summary={audioEntry.summary}
              duration={audioEntry.duration}
              emotions={audioEntry.emotions || []}
              tags={audioEntry.tags || []}
            />
          </div>
        )}

        {/* Text Notes */}
        {trade.notes && (
          <div>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-2"
            >
              {showNotes ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span>Text Notes</span>
            </button>

            {showNotes && (
              <div className="p-3 bg-black/20 border border-white/10 rounded-lg">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {trade.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Content Message */}
        {!audioEntry && !trade.notes && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No journal entry yet. Record audio or add notes.
          </div>
        )}

        {/* Emotions & Tags */}
        <div className="flex flex-wrap gap-2">
          {/* AI Extracted Emotions */}
          {audioEntry?.emotions?.map((emotion: string, idx: number) => (
            <span
              key={`emotion-${idx}`}
              className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded"
            >
              😠 {emotion}
            </span>
          ))}

          {/* Manual Emotions */}
          {trade.emotions?.map((emotion: string, idx: number) => (
            <span
              key={`manual-emotion-${idx}`}
              className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded"
            >
              {emotion}
            </span>
          ))}

          {/* AI Extracted Tags */}
          {audioEntry?.tags?.map((tag: string, idx: number) => (
            <span
              key={`ai-tag-${idx}`}
              className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}

          {/* Manual Tags */}
          {trade.tags?.map((tag: string, idx: number) => (
            <span
              key={`manual-tag-${idx}`}
              className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
