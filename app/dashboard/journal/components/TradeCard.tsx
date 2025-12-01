'use client'

import { useState, useRef, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Tag,
  Star,
  Image as ImageIcon,
  X,
} from 'lucide-react'
import type { Trade } from '@/lib/behavioral/types'

import { formatCurrency } from '@/lib/behavioral/utils'
import EmotionPicker from './EmotionPicker'
import { createBrowserClient } from '@supabase/ssr'



interface TradeCardProps {
  trade: Trade
  onUpdate: () => void
}

export default function TradeCard({ trade, onUpdate }: TradeCardProps) {
  const [notes, setNotes] = useState(trade.notes || '')
  const [tags] = useState<string[]>(trade.tags || [])
  const [emotion, setEmotion] = useState(trade.emotion)
  const [rating, setRating] = useState(trade.rating || 0)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [screenshotUrl, setScreenshotUrl] = useState(trade.screenshot_url || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

  const isWin = trade.pnl > 0
  const Icon = isWin ? TrendingUp : TrendingDown

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      if (
        notes === trade.notes &&
        emotion === trade.emotion &&
        rating === (trade.rating || 0)
      ) {
        return
      }

      setIsSaving(true)
      const { error } = await supabase
        .from('trades')
        .update({ notes, emotion, rating })
        .eq('id', trade.id)

      if (!error) {
        setLastSaved(new Date())
        onUpdate()
      }
      setIsSaving(false)
    }, 500)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [notes, emotion, rating])

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log('upload user', user?.id)
      if (!user) {
        console.error('No auth user for upload; RLS sees anonymous')
        setUploading(false)
        return
      }

      const extension = file.name.split('.').pop()
      const fileName = `${trade.user_id}/${trade.id}-${Date.now()}.${extension}`

      const { data, error } = await supabase.storage
        .from('trade-screenshots')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        console.error('Upload error', error)
        setUploading(false)
        return
      }

      const { data: publicData } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(fileName)

      const publicUrl = publicData?.publicUrl || ''

      const { error: updateError } = await supabase
        .from('trades')
        .update({ screenshot_url: publicUrl })
        .eq('id', trade.id)

      if (!updateError) {
        setScreenshotUrl(publicUrl)
        onUpdate()
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div
      className={`
        bg-[#111216] border border-[#282A30] rounded-2xl p-5 
        hover:bg-[#151720] hover:ring-2 hover:ring-${isWin ? 'emerald' : 'red'}-500/20 
        transition-all duration-150 hover:scale-[1.01]
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${isWin ? 'text-green-500' : 'text-red-500'}`} />
          <h3 className="text-white font-semibold">{trade.tradingsymbol}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-lg font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>
            {isWin ? '+' : '-'}
            {formatCurrency(Math.abs(trade.pnl))}
          </span>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(trade.trade_date).toLocaleDateString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-300 mb-3 pb-3 border-b border-[#3F3F46]">
        <div className="flex justify-between">
          <span>Entry: {formatCurrency(trade.entry_price || trade.average_price)}</span>
          <span>Exit: {formatCurrency(trade.exit_price || trade.average_price)}</span>
        </div>
        <div className="flex gap-4 mt-1 text-xs text-gray-400">
          <span>Qty: {trade.quantity}</span>
          <span>Setup: {trade.setup_type || 'N/A'}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-[#32B8C6]" />
          <span className="text-sm text-gray-400">Notes</span>
          {isSaving && <span className="text-xs text-gray-500">Saving...</span>}
          {!isSaving && lastSaved && (
            <span className="text-xs text-gray-500">
              ✓ Saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s ago
            </span>
          )}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add journal notes about this trade..."
          className="w-full bg-[#1F2123] border border-[#3F3F46] rounded-lg p-3 text-sm text-gray-200
                     focus:ring-2 focus:ring-[#32B8C6] focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-3.5 h-3.5 text-[#32B8C6]" />
          <span className="text-sm text-gray-400">Tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-[#32B8C6]/10 text-[#32B8C6] text-xs rounded-md border border-[#32B8C6]/30"
            >
              #{tag}
            </span>
          ))}
          {tags.length === 0 && (
            <span className="text-xs text-gray-500">No tags yet (coming soon: tag editor)</span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <EmotionPicker value={emotion} onChange={(newEmotion) => setEmotion(newEmotion)} />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#32B8C6]" />
            <span className="text-sm text-gray-400">Screenshot</span>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-2 py-1 rounded-md border border-[#282A30] bg-[#050608]
                       text-gray-200 hover:border-[#32B8C6] transition-colors"
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : screenshotUrl ? 'Replace' : 'Upload'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleScreenshotChange}
        />

        {screenshotUrl ? (
          <div className="relative mt-2 group">
            <img
              src={screenshotUrl}
              alt="Trade screenshot"
              className="w-full rounded-lg border border-[#282A30] object-cover max-h-64"
            />
            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase
                  .from('trades')
                  .update({ screenshot_url: null })
                  .eq('id', trade.id)
                if (!error) {
                  setScreenshotUrl('')
                  onUpdate()
                }
              }}
              className="absolute top-2 right-2 rounded-full bg-black/70 p-1
                         text-gray-200 hover:text-red-400"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Attach a chart screenshot or execution view for this trade.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => setRating(star)} className="transition-colors">
            <Star
              className={`w-4 h-4 ${
                star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
