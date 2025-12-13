'use client'

import { useMemo } from 'react'
import { Trade } from '@/types/trade'
import { PnLIndicator } from '@/components/PnLIndicator'
import { Tag } from 'lucide-react'

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
    return null
  }

  const topWinRate = [...tagStats]
    .filter((s) => s.count >= 3)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 3)

  const topLosers = [...tagStats]
    .filter((s) => s.count >= 3)
    .sort((a, b) => a.winRate - b.winRate)
    .slice(0, 3)

  return (
    <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5">
      <div className="flex items-center gap-2 mb-6">
        <Tag className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Tag Performance</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Most Common Tags */}
        <div>
          <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            Most Common Tags
          </h4>
          <div className="space-y-2">
            {tagStats.slice(0, 5).map((stat) => (
              <div
                key={stat.tag}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="text-white text-sm font-medium">{stat.tag}</span>
                <span className="text-gray-400 text-xs">
                  {stat.count} trades
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Performing Tags */}
        <div>
          <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            Best Performing Tags
          </h4>
          <div className="space-y-2">
            {topWinRate.length > 0 ? (
              topWinRate.map((stat) => (
                <div
                  key={stat.tag}
                  className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg"
                >
                  <span className="text-white text-sm font-medium">{stat.tag}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm font-bold">
                      {stat.winRate.toFixed(0)}%
                    </span>
                    <PnLIndicator value={stat.totalPnL} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs p-3">
                Need at least 3 trades per tag
              </p>
            )}
          </div>
        </div>

        {/* Worst Performing Tags */}
        <div>
          <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            Tags to Avoid
          </h4>
          <div className="space-y-2">
            {topLosers.length > 0 ? (
              topLosers.map((stat) => (
                <div
                  key={stat.tag}
                  className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                >
                  <span className="text-white text-sm font-medium">{stat.tag}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 text-sm font-bold">
                      {stat.winRate.toFixed(0)}%
                    </span>
                    <PnLIndicator value={stat.totalPnL} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs p-3">
                Need at least 3 trades per tag
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="pt-4 border-t border-white/5 flex items-center gap-6 text-sm">
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
