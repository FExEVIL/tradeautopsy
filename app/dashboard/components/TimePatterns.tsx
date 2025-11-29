'use client'

import { useMemo } from 'react'
import { Trade } from '@/types/trade'

interface TimePatternsProps {
  trades: Trade[]
}

interface TimeStats {
  period: string
  count: number
  wins: number
  losses: number
  winRate: number
  totalPnL: number
}

export function TimePatterns({ trades }: TimePatternsProps) {
  const { hourlyStats, dailyStats, bestTime, worstTime } = useMemo(() => {
    // Only analyze trades with valid timestamps
    const tradesWithTime = trades.filter((t) => t.trade_date)

    // Group by hour of day
    const hourMap = new Map<number, TimeStats>()
    // Group by day of week
    const dayMap = new Map<number, TimeStats>()

    tradesWithTime.forEach((trade) => {
      const date = new Date(trade.trade_date)
      const hour = date.getHours()
      const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday

      // Update hourly stats
      const hourStats = hourMap.get(hour) || {
        period: `${hour.toString().padStart(2, '0')}:00`,
        count: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalPnL: 0,
      }
      hourStats.count++
      hourStats.totalPnL += trade.pnl || 0
      if ((trade.pnl || 0) > 0) hourStats.wins++
      if ((trade.pnl || 0) < 0) hourStats.losses++
      hourStats.winRate =
        hourStats.count > 0 ? (hourStats.wins / hourStats.count) * 100 : 0
      hourMap.set(hour, hourStats)

      // Update daily stats
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayStats = dayMap.get(dayOfWeek) || {
        period: dayNames[dayOfWeek],
        count: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalPnL: 0,
      }
      dayStats.count++
      dayStats.totalPnL += trade.pnl || 0
      if ((trade.pnl || 0) > 0) dayStats.wins++
      if ((trade.pnl || 0) < 0) dayStats.losses++
      dayStats.winRate =
        dayStats.count > 0 ? (dayStats.wins / dayStats.count) * 100 : 0
      dayMap.set(dayOfWeek, dayStats)
    })

    const hourlyStats = Array.from(hourMap.values())
      .filter((s) => s.count >= 3) // Min 3 trades
      .sort((a, b) => parseInt(a.period) - parseInt(b.period))

    const dailyStats = Array.from(dayMap.values())
      .filter((s) => s.count >= 3)
      .sort(
        (a, b) =>
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(a.period) -
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(b.period)
      )

    const allTimeSlots = [...hourlyStats, ...dailyStats]
    const bestTime = allTimeSlots.length
      ? [...allTimeSlots].sort((a, b) => b.winRate - a.winRate)[0]
      : null
    const worstTime = allTimeSlots.length
      ? [...allTimeSlots].sort((a, b) => a.winRate - b.winRate)[0]
      : null

    return { hourlyStats, dailyStats, bestTime, worstTime }
  }, [trades])

  if (hourlyStats.length === 0 && dailyStats.length === 0) {
    return null
  }

  return (
    <div className="bg-neutral-900 rounded-xl border border-gray-800 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-xl font-bold text-white">Time-based Patterns</h2>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {bestTime && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Best Time to Trade</p>
            <p className="text-2xl font-bold text-emerald-400">
              {bestTime.period}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              {bestTime.winRate.toFixed(0)}% win rate • {bestTime.count} trades
            </p>
          </div>
        )}
        {worstTime && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Worst Time to Trade</p>
            <p className="text-2xl font-bold text-red-400">{worstTime.period}</p>
            <p className="text-sm text-gray-300 mt-1">
              {worstTime.winRate.toFixed(0)}% win rate • {worstTime.count} trades
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Hour */}
        {hourlyStats.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Performance by Hour
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {hourlyStats.map((stat) => (
                <div
                  key={stat.period}
                  className="flex items-center justify-between bg-black/30 rounded-lg p-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-medium w-12">
                      {stat.period}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {stat.count} trades
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        stat.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {stat.winRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Day */}
        {dailyStats.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Performance by Day of Week
            </h3>
            <div className="space-y-2">
              {dailyStats.map((stat) => (
                <div
                  key={stat.period}
                  className="flex items-center justify-between bg-black/30 rounded-lg p-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-medium w-12">
                      {stat.period}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {stat.count} trades
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        stat.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {stat.winRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        * Only showing time periods with 3+ trades
      </p>
    </div>
  )
}
