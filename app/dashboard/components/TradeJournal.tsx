'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ChevronDown, ChevronUp, Save, Edit2, X } from 'lucide-react'

interface JournalEntry {
  id: string
  trade_id: string
  pre_trade_plan: string
  entry_reason: string
  exit_reason: string
  emotions_before: string[]
  emotions_after: string[]
  mistakes: string
  lessons: string
  rating: number
  would_take_again: boolean
  created_at: string
}

const EMOTIONS = [
  'Confident', 'Fearful', 'Greedy', 'Neutral', 
  'Anxious', 'Excited', 'Frustrated', 'Disciplined'
]

export function TradeJournal({ tradeId }: { tradeId: string }) {
  const supabase = createClient()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    pre_trade_plan: '',
    entry_reason: '',
    exit_reason: '',
    emotions_before: [] as string[],
    emotions_after: [] as string[],
    mistakes: '',
    lessons: '',
    rating: 3,
    would_take_again: true,
  })

  useEffect(() => {
    loadEntry()
  }, [tradeId])

  const loadEntry = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('trade_id', tradeId)
      .single()
    
    if (data) {
      setEntry(data)
      setFormData(data)
    }
  }

  const toggleEmotion = (emotion: string, type: 'before' | 'after') => {
    const key = type === 'before' ? 'emotions_before' : 'emotions_after'
    const current = formData[key]
    
    setFormData({
      ...formData,
      [key]: current.includes(emotion)
        ? current.filter(e => e !== emotion)
        : [...current, emotion]
    })
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('journal_entries')
        .upsert({
          trade_id: tradeId,
          user_id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        })
      
      await loadEntry()
      setIsEditing(false)
    }
    setLoading(false)
  }

  if (!entry && !isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full py-8 border-2 border-dashed border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-all"
      >
        <div className="flex flex-col items-center gap-2">
          <Edit2 className="w-6 h-6" />
          <span>Add Journal Entry</span>
        </div>
      </button>
    )
  }

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Edit2 className="w-5 h-5" />
          Trade Journal
        </h3>
        <div className="flex items-center gap-3">
          {entry && !isEditing && (
            <div className="flex gap-1">
              {[...Array(entry.rating)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">★</span>
              ))}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-800">
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Pre-Trade Plan
                </label>
                <textarea
                  value={formData.pre_trade_plan}
                  onChange={(e) => setFormData({...formData, pre_trade_plan: e.target.value})}
                  placeholder="What was your plan before entering?"
                  rows={3}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Entry Reason
                  </label>
                  <textarea
                    value={formData.entry_reason}
                    onChange={(e) => setFormData({...formData, entry_reason: e.target.value})}
                    placeholder="Why did you enter?"
                    rows={3}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Exit Reason
                  </label>
                  <textarea
                    value={formData.exit_reason}
                    onChange={(e) => setFormData({...formData, exit_reason: e.target.value})}
                    placeholder="Why did you exit?"
                    rows={3}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Emotions Before Trade
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map(emotion => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion, 'before')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.emotions_before.includes(emotion)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Emotions After Trade
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map(emotion => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion, 'after')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.emotions_after.includes(emotion)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Mistakes Made
                </label>
                <textarea
                  value={formData.mistakes}
                  onChange={(e) => setFormData({...formData, mistakes: e.target.value})}
                  placeholder="What went wrong?"
                  rows={3}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Lessons Learned
                </label>
                <textarea
                  value={formData.lessons}
                  onChange={(e) => setFormData({...formData, lessons: e.target.value})}
                  placeholder="What did you learn?"
                  rows={3}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFormData({...formData, rating: star})}
                      className="text-4xl transition-transform hover:scale-110"
                    >
                      {star <= formData.rating ? (
                        <span className="text-yellow-400">★</span>
                      ) : (
                        <span className="text-gray-700">★</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.would_take_again}
                  onChange={(e) => setFormData({...formData, would_take_again: e.target.checked})}
                  className="w-5 h-5"
                />
                <span className="text-white">I would take this trade again</span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : entry && (
            <div className="space-y-4">
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Edit Entry
              </button>
              {entry.pre_trade_plan && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Pre-Trade Plan</h4>
                  <p className="text-white">{entry.pre_trade_plan}</p>
                </div>
              )}
              {entry.entry_reason && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Entry Reason</h4>
                  <p className="text-white">{entry.entry_reason}</p>
                </div>
              )}
              {entry.exit_reason && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Exit Reason</h4>
                  <p className="text-white">{entry.exit_reason}</p>
                </div>
              )}
              {entry.mistakes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Mistakes</h4>
                  <p className="text-white">{entry.mistakes}</p>
                </div>
              )}
              {entry.lessons && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Lessons Learned</h4>
                  <p className="text-white">{entry.lessons}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
