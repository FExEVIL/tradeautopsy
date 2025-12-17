'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { 
  Search, Eye, Star, Tag, AlertTriangle, Image as ImageIcon, X, Upload, Save, Loader2,
  ChevronLeft, ChevronRight, Mic
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { compressImage, shouldCompressImage } from '@/lib/image-compression'
import { isJournaled } from '@/lib/journal-utils'
import { PnLIndicator } from '@/components/PnLIndicator'
import { formatINR } from '@/lib/formatters'
import { AnimatedProgressBar } from '../components/AnimatedProgressBar'
import { useDebounce } from '@/lib/useDebounce'
import { AudioRecordModal } from './components/AudioRecordModal'
import { JournalList } from './components/JournalList'

type Trade = {
  id: string
  symbol: string
  trade_date: string
  entry_price: number
  exit_price: number
  quantity: number
  pnl: number
  status: string
  setup?: string
  notes?: string
  mistakes?: string[]
  execution_rating?: number
  screenshot_url?: string
}

const COMMON_SETUPS = ['Bull Flag', 'Opening Range Breakout', 'VWAP Bounce', 'Support/Resistance', 'Momentum', 'Scalp', 'Uncategorized']
const COMMON_MISTAKES = ['FOMO', 'Revenge Trading', 'Wide Stop', 'No Plan', 'Overtrading', 'Poor Entry', 'Early Exit']
const PAGE_SIZE = 25

interface JournalClientProps {
  initialTrades: any[]
  searchParams?: {
    has_audio?: string
    date_from?: string
    date_to?: string
    search?: string
  }
  stats?: {
    total: number
    audio: number
    text: number
  }
}

export default function JournalClient({ 
  initialTrades,
  searchParams = {},
  stats
}: JournalClientProps) {
  const [searchTerm, setSearchTerm] = useState(searchParams?.search || '')
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [filterType, setFilterType] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL')
  const [journalFilter, setJournalFilter] = useState<'ALL' | 'JOURNALED' | 'NOT_JOURNALED'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards') // Default to cards for audio journals
  
  // Edit states - fully local until save
  const [editedRating, setEditedRating] = useState(0)
  const [editedSetup, setEditedSetup] = useState('')
  const [editedMistakes, setEditedMistakes] = useState<string[]>([])
  const [editedNotes, setEditedNotes] = useState('')
  const [editedScreenshotUrl, setEditedScreenshotUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const supabase = createClient()

  const processedTrades = useMemo(() => {
    return (initialTrades || []).map(t => ({
      ...t,
      symbol: t.symbol || t.tradingsymbol || 'UNKNOWN',
      pnl: typeof t.pnl === 'number' ? t.pnl : parseFloat(t.pnl || '0'),
      status: parseFloat(t.pnl || 0) > 0 ? 'WIN' : parseFloat(t.pnl || 0) < 0 ? 'LOSS' : 'BE',
      setup: t.setup || 'Uncategorized',
      mistakes: Array.isArray(t.mistakes) ? t.mistakes : [],
      execution_rating: t.execution_rating || 0,
      notes: t.notes || '',
      screenshot_url: t.screenshot_url || null,
      // Preserve audio journal entries from server
      audio_journal_entries: t.audio_journal_entries || [],
      has_audio_journal: t.has_audio_journal || (t.audio_journal_entries && t.audio_journal_entries.length > 0) || false,
    }))
  }, [initialTrades])

  // Calculate journal progress from trades (client-side)
  const progress = useMemo(() => {
    const journaled = processedTrades.filter(isJournaled).length
    const total = processedTrades.length
    return {
      journaled,
      total,
      percentage: total > 0 ? Math.round((journaled / total) * 100) : 0,
    }
  }, [processedTrades])

  const filteredTrades = useMemo(() => {
    let result = processedTrades.filter(t => {
      const safeSymbol = (t.symbol || '').toLowerCase()
      const safeSetup = (t.setup || '').toLowerCase()
      const safeNotes = (t.notes || '').toLowerCase()
      const audioTranscript = t.audio_journal_entries?.[0]?.transcript?.toLowerCase() || ''
      const audioSummary = t.audio_journal_entries?.[0]?.summary?.toLowerCase() || ''
      const searchLower = searchTerm.toLowerCase()
      
      // Enhanced search - includes audio transcripts
      const matchesSearch = !searchTerm || 
        safeSymbol.includes(searchLower) || 
        safeSetup.includes(searchLower) ||
        safeNotes.includes(searchLower) ||
        audioTranscript.includes(searchLower) ||
        audioSummary.includes(searchLower)
      
      const matchesFilter = filterType === 'ALL' || t.status === filterType
      const matchesJournal = journalFilter === 'ALL' 
        ? true 
        : journalFilter === 'JOURNALED' 
          ? isJournaled(t)
          : !isJournaled(t)
      
      // Apply audio filter from URL params
      const matchesAudioFilter = !searchParams?.has_audio || 
        (searchParams.has_audio === 'true' && t.has_audio_journal) ||
        (searchParams.has_audio === 'false' && !t.has_audio_journal)
      
      return matchesSearch && matchesFilter && matchesJournal && matchesAudioFilter
    })

    return result
  }, [processedTrades, searchTerm, filterType, journalFilter, searchParams?.has_audio])

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / PAGE_SIZE)
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredTrades.slice(start, start + PAGE_SIZE)
  }, [filteredTrades, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterType, journalFilter])

  const handleOpenTrade = (trade: Trade) => {
    setSelectedTrade(trade)
    setEditedRating(trade.execution_rating || 0)
    setEditedSetup(trade.setup || 'Uncategorized')
    setEditedMistakes(trade.mistakes || [])
    setEditedNotes(trade.notes || '')
    setEditedScreenshotUrl(trade.screenshot_url || null)
  }

  const handleSave = async () => {
    if (!selectedTrade) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('trades')
        .update({
          execution_rating: editedRating,
          setup: editedSetup,
          mistakes: editedMistakes,
          notes: editedNotes,
          screenshot_url: editedScreenshotUrl
        })
        .eq('id', selectedTrade.id)

      if (!error) {
        // Update local state
        selectedTrade.execution_rating = editedRating
        selectedTrade.setup = editedSetup
        selectedTrade.mistakes = editedMistakes
        selectedTrade.notes = editedNotes
        selectedTrade.screenshot_url = editedScreenshotUrl || undefined
        
        // Progress will update automatically via useMemo when processedTrades changes
      } else {
        alert('Error saving: ' + error.message)
      }
    } catch (err) {
      alert('Error saving trade')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleMistake = (mistake: string) => {
    if (editedMistakes.includes(mistake)) {
      setEditedMistakes(editedMistakes.filter(m => m !== mistake))
    } else {
      setEditedMistakes([...editedMistakes, mistake])
    }
  }

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedTrade) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, or WebP)')
      return
    }

    setIsUploading(true)
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        alert('Authentication error. Please log in again.')
        return
      }

      // Compress image if needed
      let fileToUpload = file
      if (shouldCompressImage(file)) {
        try {
          fileToUpload = await compressImage(file)
        } catch (compressError) {
          console.warn('Compression failed, uploading original:', compressError)
        }
      }

      // Generate unique filename with user_id in path
      const fileExt = fileToUpload.name.split('.').pop() || 'jpg'
      const fileName = `${user.id}/${selectedTrade.id}-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('trade-screenshots')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert(`Upload failed: ${uploadError.message}. Please try again.`)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(fileName)

      setEditedScreenshotUrl(publicUrl)
      
    } catch (err) {
      console.error('Upload error:', err)
      alert(`Upload error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 flex flex-col">
      <div className="max-w-[1600px] mx-auto w-full space-y-6 flex-1">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Journal</h1>
            <p className="text-gray-400 text-sm mt-1">Document your trades with notes and voice recordings</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Audio Stats */}
            {stats && (
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-500 uppercase">Audio</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-white">{stats.audio}</span>
                </div>
                <div className="px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded-lg">
                  <span className="text-xs text-gray-500 uppercase block">Total</span>
                  <span className="text-lg font-mono font-bold text-white">{stats.total}</span>
                </div>
              </div>
            )}
            {/* Record Audio Button */}
            <AudioRecordModal />
          </div>
        </div>

        {/* Journal Progress Bar */}
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Journal Progress</h3>
              <p className="text-xs text-gray-400">
                {progress.journaled} of {progress.total} trades journaled
              </p>
            </div>
            <div className="text-2xl font-bold text-white">
              {progress.percentage}%
            </div>
          </div>
          <AnimatedProgressBar
            value={progress.percentage}
            barClassName="bg-gradient-to-r from-green-500 to-green-400"
          />
        </div>

        {/* Audio Journal Filters - Removed, using new page.tsx filters instead */}

        {/* Cards View - Show audio journals */}
        {viewMode === 'cards' && (
          <JournalList trades={filteredTrades} searchTerm={searchTerm} />
        )}

        {/* Table View - Original table layout */}
        {viewMode === 'table' && (
          <>
        <div className="flex items-center justify-between bg-[#0F0F0F] p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 w-full max-w-md relative">
             <Search className="w-4 h-4 text-gray-500 absolute left-3" />
             <input 
               type="text" 
               placeholder="Search symbol, setup, or notes..." 
               className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-2">
             {['ALL', 'WIN', 'LOSS'].map(type => (
               <button 
                 key={type}
                 onClick={() => setFilterType(type as any)}
                 className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                   filterType === type 
                     ? 'bg-white text-black' 
                     : 'text-gray-400 hover:bg-white/5'
                 }`}
               >
                 {type}
               </button>
             ))}
             <div className="h-6 w-px bg-white/10 mx-1" />
             {['ALL', 'JOURNALED', 'NOT_JOURNALED'].map(type => (
               <button 
                 key={type}
                 onClick={() => setJournalFilter(type as any)}
                 className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                   journalFilter === type 
                     ? 'bg-emerald-500 text-white' 
                     : 'text-gray-400 hover:bg-white/5'
                 }`}
               >
                 {type === 'JOURNALED' ? 'Journaled' : type === 'NOT_JOURNALED' ? 'Not Journaled' : 'All'}
               </button>
             ))}
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-white/5 rounded-xl overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-white/5 text-xs text-gray-500 uppercase bg-[#111]">
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Symbol</th>
                    <th className="px-6 py-4 font-medium">Setup</th>
                    <th className="px-6 py-4 font-medium text-right">P&L</th>
                    <th className="px-6 py-4 font-medium text-center">Execution</th>
                    <th className="px-6 py-4 font-medium text-center">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {paginatedTrades.map((trade) => (
                    <tr 
                      key={trade.id} 
                      onClick={() => handleOpenTrade(trade)}
                      className="group hover:bg-white/[0.02] transition-colors cursor-pointer text-sm"
                    >
                       <td className="px-6 py-4 text-gray-400 font-mono">
                          {new Date(trade.trade_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{trade.symbol}</span>
                            {trade.has_audio_journal && (
                              <Mic className="w-3 h-3 text-purple-400" />
                            )}
                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                               trade.status === 'WIN' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                               {trade.status}
                            </span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded bg-white/5 text-gray-300 text-xs border border-white/5">
                             {trade.setup}
                          </span>
                       </td>
                       <td className={`px-6 py-4 text-right`}>
                          <PnLIndicator value={trade.pnl} size="sm" />
                       </td>
                       <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                             {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                   key={star} 
                                   className={`w-3 h-3 ${star <= (trade.execution_rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700'}`} 
                                />
                             ))}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                             <Eye className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
           {paginatedTrades.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                 No trades found matching your filters.
              </div>
           )}
        </div>
          </>
        )}

        {/* Pagination - Only show for table view */}
        {viewMode === 'table' && totalPages > 1 && (
          <div className="flex items-center justify-between bg-[#0F0F0F] p-4 rounded-xl border border-white/5">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredTrades.length)} of {filteredTrades.length} trades
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-[#0A0A0A] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-[#0A0A0A] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* EDITABLE DRAWER */}
      {selectedTrade && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-[#0F0F0F] border-l border-white/10 h-full overflow-y-auto p-8 shadow-2xl">
               
               <div className="flex items-start justify-between mb-8">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-white">{selectedTrade.symbol}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                           selectedTrade.pnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                           {selectedTrade.pnl >= 0 ? 'WIN' : 'LOSS'}
                        </span>
                     </div>
                     <p className="text-gray-400">{new Date(selectedTrade.trade_date).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setSelectedTrade(null)} className="p-2 hover:bg-white/10 rounded-lg">
                     <X className="w-6 h-6 text-gray-400" />
                  </button>
               </div>

               <div className={`p-6 rounded-xl mb-8 border ${
                  selectedTrade.pnl >= 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
               }`}>
                  <div className="flex justify-between items-center">
                     <div>
                        <p className="text-xs uppercase opacity-70 mb-1">Realized P&L</p>
                        <PnLIndicator value={selectedTrade.pnl} size="lg" />
                     </div>
                     <div className="text-right">
                        <p className="text-xs uppercase opacity-70 mb-1">Quantity</p>
                        <p className="text-xl font-mono font-bold text-white">{selectedTrade.quantity}</p>
                     </div>
                  </div>
               </div>

               {/* EXECUTION RATING */}
               <div className="mb-8 p-6 bg-[#0A0A0A] rounded-lg border border-white/5">
                  <h3 className="text-white font-semibold mb-3">Execution Quality</h3>
                  <div className="flex items-center gap-2">
                     {[1, 2, 3, 4, 5].map(star => (
                        <button
                           key={star}
                           onClick={() => setEditedRating(star)}
                           className="transition-transform hover:scale-110"
                        >
                           <Star 
                              className={`w-8 h-8 cursor-pointer ${star <= editedRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700 hover:text-gray-600'}`} 
                           />
                        </button>
                     ))}
                     <span className="ml-4 text-gray-400 text-sm">
                        {editedRating === 0 && 'Not rated'}
                        {editedRating === 1 && 'Poor execution'}
                        {editedRating === 2 && 'Below average'}
                        {editedRating === 3 && 'Average'}
                        {editedRating === 4 && 'Good execution'}
                        {editedRating === 5 && 'Perfect execution'}
                     </span>
                  </div>
               </div>

               {/* SETUP SELECTOR */}
               <div className="mb-8">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                     <Tag className="w-4 h-4 text-blue-400" /> Playbook Setup
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {COMMON_SETUPS.map(setup => (
                        <button
                           key={setup}
                           onClick={() => setEditedSetup(setup)}
                           className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                              editedSetup === setup
                                 ? 'bg-blue-500 text-white border-2 border-blue-400'
                                 : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                           }`}
                        >
                           {setup}
                        </button>
                     ))}
                  </div>
               </div>

               {/* MISTAKES SELECTOR */}
               <div className="mb-8">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                     <AlertTriangle className="w-4 h-4 text-orange-400" /> Mistakes Made
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {COMMON_MISTAKES.map(mistake => (
                        <button
                           key={mistake}
                           onClick={() => toggleMistake(mistake)}
                           className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                              editedMistakes.includes(mistake)
                                 ? 'bg-orange-500 text-white border-2 border-orange-400'
                                 : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                           }`}
                        >
                           {mistake}
                        </button>
                     ))}
                  </div>
               </div>

               {/* NOTES EDITOR - Fully local, no debounce on keystroke */}
               <div className="mb-8">
                  <h3 className="text-white font-semibold mb-3">Journal Notes</h3>
                  <textarea
                     value={editedNotes}
                     onChange={(e) => setEditedNotes(e.target.value)}
                     placeholder="What did you learn from this trade?"
                     className="w-full p-4 bg-[#0A0A0A] rounded-lg border border-white/5 text-gray-300 text-sm leading-relaxed resize-none focus:outline-none focus:border-blue-500 transition-colors"
                     rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Changes are saved when you click "Save Changes"
                  </p>
               </div>

               {/* SCREENSHOT UPLOAD */}
               <div className="mb-8">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                     <ImageIcon className="w-4 h-4 text-purple-400" /> Chart Screenshot
                  </h3>
                  <div className="aspect-video bg-[#0A0A0A] rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:border-white/20 transition-colors relative overflow-hidden">
                     {isUploading ? (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                           <Loader2 className="w-8 h-8 animate-spin" />
                           <span className="text-sm">Uploading...</span>
                        </div>
                     ) : editedScreenshotUrl ? (
                        <>
                           {/* ✅ Use Next/Image for optimization */}
                           <img 
                             src={editedScreenshotUrl} 
                             alt="Chart" 
                             className="w-full h-full object-cover rounded-lg"
                             width={800}
                             height={450}
                             loading="lazy"
                           />
                           <label className="absolute inset-0 cursor-pointer bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-white text-center">
                                 <Upload className="w-8 h-8 mx-auto mb-2" />
                                 <span className="text-sm">Click to replace</span>
                              </div>
                              <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                           </label>
                        </>
                     ) : (
                        <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                           <Upload className="w-8 h-8 mb-2 text-gray-600" />
                           <span className="text-sm text-gray-600">Click to upload screenshot</span>
                           <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                        </label>
                     )}
                  </div>
               </div>

               {/* SAVE BUTTON */}
               <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
               </button>

            </div>
         </div>
      )}
    </div>
  )
}
