'use client'

import { useMemo } from 'react'
import { Trade } from '@/types/trade'
import { PnLIndicator } from '@/components/PnLIndicator'
import { Clock } from 'lucide-react'

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
    const tradesWithTime = trades.filter((t) => t.trade_date)

    const hourMap = new Map<number, TimeStats>()
    const dayMap = new Map<number, TimeStats>()

    tradesWithTime.forEach((trade) => {
      const date = new Date(trade.trade_date)
      const hour = date.getHours()
      const dayOfWeek = date.getDay()

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
      .filter((s) => s.count >= 3)
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
    <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Time-based Patterns</h3>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {bestTime && (
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Best Time to Trade</p>
            <p className="text-2xl font-bold text-emerald-400 mb-1">
              {bestTime.period}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-300">
                {bestTime.winRate.toFixed(0)}% win rate
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-sm text-gray-300">{bestTime.count} trades</span>
            </div>
            <div className="mt-2">
              <PnLIndicator value={bestTime.totalPnL} size="sm" />
            </div>
          </div>
        )}
        {worstTime && (
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Worst Time to Trade</p>
            <p className="text-2xl font-bold text-red-400 mb-1">{worstTime.period}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-300">
                {worstTime.winRate.toFixed(0)}% win rate
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-sm text-gray-300">{worstTime.count} trades</span>
            </div>
            <div className="mt-2">
              <PnLIndicator value={worstTime.totalPnL} size="sm" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Hour */}
        {hourlyStats.length > 0 && (
          <div>
            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
              Performance by Hour
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {hourlyStats.map((stat) => (
                <div
                  key={stat.period}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-medium w-12">
                      {stat.period}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {stat.count} trades
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${
                        stat.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {stat.winRate.toFixed(0)}%
                    </span>
                    <PnLIndicator value={stat.totalPnL} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Day */}
        {dailyStats.length > 0 && (
          <div>
            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
              Performance by Day of Week
            </h4>
            <div className="space-y-2">
              {dailyStats.map((stat) => (
                <div
                  key={stat.period}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-medium w-12">
                      {stat.period}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {stat.count} trades
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${
                        stat.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {stat.winRate.toFixed(0)}%
                    </span>
                    <PnLIndicator value={stat.totalPnL} size="sm" />
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
