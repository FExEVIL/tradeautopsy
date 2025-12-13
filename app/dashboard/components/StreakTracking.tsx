'use client'

import { useMemo } from 'react'
import { Trade } from '@/types/trade'
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

interface StreakTrackingProps {
  trades: Trade[]
}

interface Streak {
  type: 'loss' | 'win' | 'tag'
  count: number
  label: string
  severity: 'warning' | 'danger' | 'success'
}

export function StreakTracking({ trades }: StreakTrackingProps) {
  const streaks = useMemo(() => {
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
    )

    const detectedStreaks: Streak[] = []

    // Check for consecutive losses
    let lossStreak = 0
    for (const trade of sortedTrades) {
      if ((trade.pnl || 0) < 0) {
        lossStreak++
      } else {
        break
      }
    }
    if (lossStreak >= 3) {
      detectedStreaks.push({
        type: 'loss',
        count: lossStreak,
        label: `${lossStreak} consecutive losses`,
        severity: lossStreak >= 5 ? 'danger' : 'warning',
      })
    }

    // Check for consecutive wins
    let winStreak = 0
    for (const trade of sortedTrades) {
      if ((trade.pnl || 0) > 0) {
        winStreak++
      } else {
        break
      }
    }
    if (winStreak >= 3) {
      detectedStreaks.push({
        type: 'win',
        count: winStreak,
        label: `${winStreak} consecutive wins`,
        severity: 'success',
      })
    }

    // Check for repeated bad tags
    const recentTrades = sortedTrades.slice(0, 5)
    const tagCounts = new Map<string, number>()
    
    recentTrades.forEach((trade) => {
      trade.journal_tags?.forEach((tag) => {
        const lowerTag = tag.toLowerCase()
        if (
          lowerTag.includes('fomo') ||
          lowerTag.includes('revenge') ||
          lowerTag.includes('tilt') ||
          lowerTag.includes('overtrading')
        ) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        }
      })
    })

    tagCounts.forEach((count, tag) => {
      if (count >= 2) {
        detectedStreaks.push({
          type: 'tag',
          count,
          label: `${count} "${tag}" trades in last 5`,
          severity: count >= 3 ? 'danger' : 'warning',
        })
      }
    })

    // Check for overtrading
    const today = new Date().toISOString().split('T')[0]
    const todayTrades = sortedTrades.filter(
      (t) => t.trade_date.split('T')[0] === today
    )
    if (todayTrades.length >= 10) {
      detectedStreaks.push({
        type: 'tag',
        count: todayTrades.length,
        label: `${todayTrades.length} trades today`,
        severity: todayTrades.length >= 15 ? 'danger' : 'warning',
      })
    }

    return detectedStreaks
  }, [trades])

  if (streaks.length === 0) {
    return null
  }

  return (
    <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Active Streaks & Alerts</h3>
      </div>

      <div className="space-y-3">
        {streaks.map((streak, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-4 border ${
              streak.severity === 'danger'
                ? 'bg-red-500/5 border-red-500/30'
                : streak.severity === 'warning'
                ? 'bg-orange-500/5 border-orange-500/30'
                : 'bg-emerald-500/5 border-emerald-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {streak.type === 'win' ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : streak.type === 'loss' ? (
                <TrendingDown className="w-5 h-5 text-red-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              )}
              <div className="flex-1">
                <p
                  className={`font-semibold text-sm ${
                    streak.severity === 'danger'
                      ? 'text-red-400'
                      : streak.severity === 'warning'
                      ? 'text-orange-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {streak.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {streak.type === 'loss' &&
                    'Consider taking a break or reviewing your strategy'}
                  {streak.type === 'win' &&
                    'Great momentum! Stay disciplined and stick to your plan'}
                  {streak.type === 'tag' &&
                    'Emotional pattern detected - step back and reset'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
