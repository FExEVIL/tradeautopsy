'use client'

import React, { useState, useEffect, useMemo, useCallback, useTransition, memo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { PnLIndicator } from '@/components/PnLIndicator'
import { formatINR } from '@/lib/formatters'

type DayData = { pnl: number; trades: any[]; count: number }
type Props = { dailyData: { [date: string]: DayData } }

// ✅ Memoized day cell component
const DayCell = memo(function DayCell({
  day,
  month,
  year,
  pnl,
  hasTrades,
  onClick,
}: {
  day: number
  month: number
  year: number
  pnl: number
  hasTrades: boolean
  onClick: (day: number) => void
}) {
  const handleClick = useCallback(() => {
    if (hasTrades) {
      onClick(day)
    }
  }, [day, hasTrades, onClick])

  const colorClass = useMemo(() => {
    if (pnl === 0) return 'bg-gray-800'
    if (pnl > 0) {
      if (pnl > 5000) return 'bg-green-500'
      if (pnl > 2000) return 'bg-green-600'
      if (pnl > 500) return 'bg-green-700'
      return 'bg-green-800'
    } else {
      if (pnl < -5000) return 'bg-red-500'
      if (pnl < -2000) return 'bg-red-600'
      if (pnl < -500) return 'bg-red-700'
      return 'bg-red-800'
    }
  }, [pnl])

  return (
    <button
      onClick={handleClick}
      disabled={!hasTrades}
      className={`aspect-square rounded-lg ${colorClass} hover:ring-2 hover:ring-white/30 transition-all flex flex-col items-center justify-center p-2 relative group cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
      style={{ contain: 'layout style paint' }}
    >
      <span className="text-xs text-white font-medium">{day}</span>
      {hasTrades && (
        <>
          <span className="text-[10px] font-mono text-white/90">
            {formatINR(pnl, { compact: true })}
          </span>
        </>
      )}
    </button>
  )
})

export default function CalendarClient({ dailyData: initialDailyData = {} }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [dailyData, setDailyData] = useState<{ [date: string]: DayData }>(initialDailyData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get month/year from URL or default to current
  const urlMonth = searchParams.get('month')
  const urlYear = searchParams.get('year')
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (urlMonth && urlYear) {
      return new Date(parseInt(urlYear), parseInt(urlMonth) - 1, 1)
    }
    return new Date()
  })
  const [selectedDay, setSelectedDay] = useState<{ date: string; data: DayData } | null>(null)

  // Memoize month/year to prevent unnecessary recalculations
  const month = useMemo(() => currentMonth.getMonth(), [currentMonth])
  const year = useMemo(() => currentMonth.getFullYear(), [currentMonth])

  // Fetch calendar data when month changes
  useEffect(() => {
    const fetchMonthData = async () => {
      // Check if we already have data for this month
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
      const hasDataForMonth = Object.keys(dailyData).some(date => date.startsWith(monthKey))
      
      // If we have initial data for current month, don't fetch again
      const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year
      if (hasDataForMonth && isCurrentMonth && Object.keys(initialDailyData).length > 0) {
        return
      }

      // Fetch data for the month
      setIsLoading(true)
      setError(null)

      try {
        const startDate = new Date(year, month, 1).toISOString().split('T')[0]
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

        const response = await fetch(
          `/api/trades/calendar?start_date=${startDate}&end_date=${endDate}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch calendar data')
        }

        const result = await response.json()
        
        if (result.success && result.data) {
          // Merge with existing data
          setDailyData(prev => ({ ...prev, ...result.data }))
        } else {
          throw new Error(result.error || 'Failed to load calendar')
        }
      } catch (err: any) {
        console.error('Calendar fetch error:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonthData()
  }, [year, month]) // Only depend on year and month

  // Update URL when month changes (debounced)
  useEffect(() => {
    const monthNum = month + 1
    const yearNum = year
    const currentMonthParam = searchParams.get('month')
    const currentYearParam = searchParams.get('year')
    
    // Only update URL if it's different from current URL params
    if (currentMonthParam !== monthNum.toString() || currentYearParam !== yearNum.toString()) {
      const newUrl = `/dashboard/calendar?month=${monthNum}&year=${yearNum}`
      router.replace(newUrl, { scroll: false })
    }
  }, [month, year, router, searchParams])

  // Navigation handlers with transitions
  const prevMonth = useCallback(() => {
    startTransition(() => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    })
  }, [startTransition])

  const nextMonth = useCallback(() => {
    startTransition(() => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    })
  }, [startTransition])

  const goToToday = useCallback(() => {
    startTransition(() => {
      setCurrentMonth(new Date())
    })
  }, [startTransition])

  // Memoize calendar grid generation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    for (let i = 0; i < adjustedFirstDay; i++) days.push(null)
    for (let day = 1; day <= daysInMonth; day++) days.push(day)
    
    return days
  }, [year, month])

  // Memoize monthly stats calculation
  const monthStats = useMemo(() => {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
    const monthDays = Object.entries(dailyData || {}).filter(([date]) => date.startsWith(monthKey))
    const monthPnL = monthDays.reduce((sum, [_, data]) => sum + (data.pnl || 0), 0)
    const winDays = monthDays.filter(([_, data]) => data.pnl > 0).length
    const loseDays = monthDays.filter(([_, data]) => data.pnl < 0).length
    const winRate = monthDays.length > 0 ? (winDays / monthDays.length) * 100 : 0

    return { monthPnL, winDays, loseDays, winRate }
  }, [dailyData, year, month])

  // Memoize date click handler
  const handleDateClick = useCallback((day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayData = dailyData[dateKey]
    
    if (dayData) {
      const returnMonth = month + 1
      const returnYear = year
      router.push(`/dashboard/calendar/${dateKey}?returnMonth=${returnMonth}&returnYear=${returnYear}`)
    }
  }, [year, month, dailyData, router])

  return (
    <div className="space-y-8">
      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Monthly P&L</span>
          </div>
          <PnLIndicator value={monthStats.monthPnL} size="lg" />
        </div>
        <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Win Rate</span>
          </div>
          <div className={`text-2xl font-bold ${monthStats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
            {monthStats.winRate.toFixed(1)}%
          </div>
        </div>
        <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Green Days</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{monthStats.winDays}</div>
        </div>
        <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Red Days</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{monthStats.loseDays}</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Profit Calendar</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              disabled={isPending || isLoading}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-semibold min-w-[150px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={nextMonth}
              disabled={isPending || isLoading}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        {(isPending || isLoading) ? (
          <div className="text-center py-20 text-gray-400">
            <div className="inline-block w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
            <p className="mt-4 text-sm">Loading calendar data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => {
                const startDate = new Date(year, month, 1).toISOString().split('T')[0]
                const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
                fetch(`/api/trades/calendar?start_date=${startDate}&end_date=${endDate}`)
                  .then(r => r.json())
                  .then(d => {
                    if (d.success) setDailyData(prev => ({ ...prev, ...d.data }))
                  })
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 calendar-grid" style={{ contain: 'layout' }}>
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square" />
              
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayData = dailyData[dateKey]
              const pnl = dayData?.pnl || 0
              const hasTrades = !!dayData

              return (
                <DayCell
                  key={day}
                  day={day}
                  month={month}
                  year={year}
                  pnl={pnl}
                  hasTrades={hasTrades}
                  onClick={handleDateClick}
                />
              )
            })}
          </div>
        )}
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-500">
          <span>Less</span>
          <div className="w-4 h-4 rounded bg-gray-800"></div>
          <div className="w-4 h-4 rounded bg-red-800"></div>
          <div className="w-4 h-4 rounded bg-red-600"></div>
          <div className="w-4 h-4 rounded bg-green-800"></div>
          <div className="w-4 h-4 rounded bg-green-600"></div>
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>More</span>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0F0F0F]">
              <div>
                <h3 className="text-xl font-bold text-white">{new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <div className="mt-1">
                  <PnLIndicator value={selectedDay.data.pnl} size="lg" />
                </div>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedDay.data.trades.map((trade, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[#0A0A0A] border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{trade.symbol || trade.tradingsymbol || 'N/A'}</span>
                    <PnLIndicator value={parseFloat(trade.pnl || '0')} size="sm" />
                  </div>
                  <div className="text-sm text-gray-400">
                    {trade.notes && <p className="mt-2 text-xs italic">"{trade.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
