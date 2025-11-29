'use client'

import { useMemo } from 'react'
import { Trade } from '@/types/trade'

interface TagAnalyticsProps {
  trades: Trade[]
}

interface TagStats {
  tag: string
  count: number
  wins: number
  losses: number
  winRate: number
  totalPnL: number
}

export function TagAnalytics({ trades }: TagAnalyticsProps) {
  const tagStats = useMemo(() => {
    const statsMap = new Map<string, TagStats>()

    // Only analyze trades with tags
    const taggedTrades = trades.filter(
      (t) => t.journal_tags && t.journal_tags.length > 0
    )

    taggedTrades.forEach((trade) => {
      trade.journal_tags?.forEach((tag) => {
        const existing = statsMap.get(tag) || {
          tag,
          count: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalPnL: 0,
        }

        existing.count++
        existing.totalPnL += trade.pnl || 0

        if ((trade.pnl || 0) > 0) {
          existing.wins++
        } else if ((trade.pnl || 0) < 0) {
          existing.losses++
        }

        existing.winRate =
          existing.count > 0 ? (existing.wins / existing.count) * 100 : 0

        statsMap.set(tag, existing)
      })
    })

    return Array.from(statsMap.values()).sort((a, b) => b.count - a.count)
  }, [trades])

  if (tagStats.length === 0) {
    return null // Don't show if no tags exist
  }

  const topWinRate = [...tagStats]
    .filter((s) => s.count >= 3) // At least 3 trades
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 3)

  const topLosers = [...tagStats]
    .filter((s) => s.count >= 3)
    .sort((a, b) => a.winRate - b.winRate)
    .slice(0, 3)

  return (
    <div className="bg-neutral-900 rounded-xl border border-gray-800 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h2 className="text-xl font-bold text-white">Behavioral Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Most Common Tags */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Most Common Tags
          </h3>
          <div className="space-y-2">
            {tagStats.slice(0, 5).map((stat) => (
              <div
                key={stat.tag}
                className="flex items-center justify-between bg-black/30 rounded-lg p-2"
              >
                <span className="text-white text-sm">{stat.tag}</span>
                <span className="text-gray-400 text-sm font-medium">
                  {stat.count} trades
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Performing Tags */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Best Performing Tags
          </h3>
          <div className="space-y-2">
            {topWinRate.length > 0 ? (
              topWinRate.map((stat) => (
                <div
                  key={stat.tag}
                  className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2"
                >
                  <span className="text-white text-sm">{stat.tag}</span>
                  <span className="text-emerald-400 text-sm font-bold">
                    {stat.winRate.toFixed(0)}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs">
                Need at least 3 trades per tag
              </p>
            )}
          </div>
        </div>

        {/* Worst Performing Tags */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Tags to Avoid
          </h3>
          <div className="space-y-2">
            {topLosers.length > 0 ? (
              topLosers.map((stat) => (
                <div
                  key={stat.tag}
                  className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-lg p-2"
                >
                  <span className="text-white text-sm">{stat.tag}</span>
                  <span className="text-red-400 text-sm font-bold">
                    {stat.winRate.toFixed(0)}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs">
                Need at least 3 trades per tag
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-6 text-sm">
        <div>
          <span className="text-gray-400">Total Journaled: </span>
          <span className="text-white font-semibold">
            {trades.filter((t) => t.journal_tags?.length).length} trades
          </span>
        </div>
        <div>
          <span className="text-gray-400">Unique Tags: </span>
          <span className="text-white font-semibold">{tagStats.length}</span>
        </div>
      </div>
    </div>
  )
}
