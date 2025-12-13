'use client'

import { useState, useMemo } from 'react'
import { Eye, MoreVertical, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Trade {
  id: string
  trade_date: string
  symbol: string
  tradingsymbol: string
  trade_type: string
  transaction_type: string
  pnl: number | null
  strategy: string | null
  setup: string | null
  execution_rating: number | null // 0-5 stars
  notes: string | null
  has_audio_journal: boolean
}

interface JournalTableProps {
  trades: Trade[]
  searchTerm?: string
  totalCount?: number
  currentPage?: number
}

export function JournalTable({ trades, searchTerm = '', totalCount = 0, currentPage = 1 }: JournalTableProps) {
  const router = useRouter()
  const perPage = 25

  // Filter by search term (client-side for current page only)
  const filteredTrades = useMemo(() => {
    if (!searchTerm) return trades
    
    const searchLower = searchTerm.toLowerCase()
    return trades.filter(trade => {
      const symbol = (trade.symbol || trade.tradingsymbol || '').toLowerCase()
      const strategy = (trade.strategy || trade.setup || '').toLowerCase()
      const notes = (trade.notes || '').toLowerCase()
      
      return (
        symbol.includes(searchLower) ||
        strategy.includes(searchLower) ||
        notes.includes(searchLower)
      )
    })
  }, [trades, searchTerm])

  const totalPages = Math.ceil((totalCount || filteredTrades.length) / perPage)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', newPage.toString())
    router.push(`/dashboard/journal?${params.toString()}`)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const formatPnL = (pnl: number | null) => {
    if (pnl === null || pnl === 0) return '+₹0'
    const formatted = Math.abs(pnl).toLocaleString('en-IN')
    return `${pnl >= 0 ? '+' : '-'}₹${formatted}`
  }

  const getTradeTypeBadge = (type: string, pnl: number | null) => {
    let label = type
    let color = 'bg-gray-500/20 text-gray-400'

    if (pnl !== null && pnl !== 0) {
      if (pnl > 0) {
        label = 'WIN'
        color = 'bg-green-500/20 text-green-400'
      } else if (pnl < 0) {
        label = 'LOSS'
        color = 'bg-red-500/20 text-red-400'
      } else {
        label = 'BE' // Break Even
        color = 'bg-yellow-500/20 text-yellow-400'
      }
    }

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
        {label}
      </span>
    )
  }

  if (filteredTrades.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No trades found matching your filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-[#111]">
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                DATE
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                SYMBOL
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                SETUP
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                P&L
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                EXECUTION
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTrades.map((trade, idx) => {
              const symbol = trade.symbol || trade.tradingsymbol || 'UNKNOWN'
              const tradeType = trade.trade_type || trade.transaction_type || 'BUY'
              
              return (
                <tr
                  key={trade.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${
                    idx % 2 === 0 ? 'bg-black/20' : ''
                  }`}
                  onClick={() => router.push(`/dashboard/trades/${trade.id}`)}
                >
                  {/* Date */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300">
                      {formatDate(trade.trade_date)}
                    </p>
                  </td>

                  {/* Symbol */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-white">{symbol}</p>
                      {getTradeTypeBadge(tradeType, trade.pnl)}
                    </div>
                  </td>

                  {/* Setup */}
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                      {trade.strategy || trade.setup || 'Uncategorized'}
                    </span>
                  </td>

                  {/* P&L */}
                  <td className="px-6 py-4 text-right">
                    <p
                      className={`font-semibold ${
                        (trade.pnl || 0) > 0
                          ? 'text-green-400'
                          : (trade.pnl || 0) < 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {formatPnL(trade.pnl)}
                    </p>
                  </td>

                  {/* Execution Rating */}
                  <td className="px-6 py-4">
                    <ExecutionRating
                      tradeId={trade.id}
                      currentRating={trade.execution_rating || 0}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/trades/${trade.id}`)
                        }}
                        className="p-2 hover:bg-white/10 rounded transition"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-white/10 rounded transition"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalCount || filteredTrades.length)} of {totalCount || filteredTrades.length} trades
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
            >
              ‹
            </button>

            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Star Rating Component with Optimistic Updates
function ExecutionRating({ tradeId, currentRating }: { tradeId: string; currentRating: number }) {
  const [rating, setRating] = useState(currentRating)
  const [hoveredRating, setHoveredRating] = useState(0)

  const updateRating = async (newRating: number) => {
    // 1. INSTANT UI update (optimistic) - no waiting for server
    const previousRating = rating
    setRating(newRating)

    try {
      // 2. Background server sync (non-blocking)
      const response = await fetch(`/api/trades/${tradeId}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ execution_rating: newRating }),
      })

      if (!response.ok) {
        // 3. Rollback if server fails
        setRating(previousRating)
        console.error('Failed to update rating')
      }
    } catch (error) {
      // 4. Rollback on network error
      setRating(previousRating)
      console.error('Failed to update rating:', error)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={(e) => {
            e.stopPropagation()
            updateRating(star)
          }}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-4 h-4 ${
              star <= (hoveredRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
