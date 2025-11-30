'use client'

import { useMemo, useState } from 'react'
import { Trade } from '@/types/trade'
import {
  aggregateTradesByDay,
  formatMonthYear,
  getMonthMatrix,
  getPnlColorClass,
} from '@/lib/profit-calendar-utils'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

type ProfitCalendarProps = {
  trades: Trade[]
}

export default function ProfitCalendar({ trades }: ProfitCalendarProps) {
  const [activeDate, setActiveDate] = useState(() => {
    const latestTrade = trades
      .slice()
      .sort((a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime())[0]
    return latestTrade ? new Date(latestTrade.trade_date) : new Date()
  })

  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const dailyMap = useMemo(() => aggregateTradesByDay(trades), [trades])

  const monthMatrix = useMemo(
    () => getMonthMatrix(activeDate.getFullYear(), activeDate.getMonth()),
    [activeDate]
  )

  const handlePrevMonth = () => {
    setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 1))
  }

  const selectedDayData = selectedDay ? dailyMap[selectedDay] : null

  return (
    <div className="bg-neutral-900 rounded-xl px-6 py-5 border border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Profit Calendar
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Daily P&L heatmap for your trading activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-300" />
          </button>
          <span className="px-3 py-1.5 text-xs font-medium text-neutral-200 rounded-md bg-neutral-800/70 border border-neutral-700">
            {formatMonthYear(activeDate)}
          </span>
          <button
            onClick={handleNextMonth}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-neutral-300" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="grid grid-cols-7 gap-1.5 text-[10px] text-neutral-500 font-medium">
          <span className="text-center">Mon</span>
          <span className="text-center">Tue</span>
          <span className="text-center">Wed</span>
          <span className="text-center">Thu</span>
          <span className="text-center">Fri</span>
          <span className="text-center">Sat</span>
          <span className="text-center">Sun</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {monthMatrix.map((week, wIdx) =>
            week.map((day, dIdx) => {
              if (!day) {
                return <div key={`${wIdx}-${dIdx}`} className="h-12" />
              }

              const dateObj = new Date(
                activeDate.getFullYear(),
                activeDate.getMonth(),
                day
              )
              const key = dateObj.toISOString().split('T')[0]
              const dayData = dailyMap[key]
              const hasTrades = !!dayData

              const pnlPercent = dayData?.pnlPercent ?? 0
              const colorClass = hasTrades
                ? getPnlColorClass(pnlPercent)
                : 'bg-neutral-800/40'

              return (
                <button
                  key={`${wIdx}-${dIdx}`}
                  onClick={() => hasTrades && setSelectedDay(key)}
                  disabled={!hasTrades}
                  className={`group relative h-12 w-full rounded-md border border-neutral-800/70 transition-all duration-150 ${
                    hasTrades
                      ? `${colorClass} hover:scale-105 hover:border-emerald-400/60 cursor-pointer`
                      : 'cursor-default'
                  }`}
                >
                  <span className="absolute left-1 top-0.5 text-[10px] font-medium text-neutral-300">
                    {day}
                  </span>
                  {hasTrades && (
                    <div className="absolute inset-0 flex items-end justify-end p-1">
                      <span className="text-[9px] font-mono font-semibold text-white">
                        {pnlPercent >= 0 ? '+' : ''}
                        {pnlPercent.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-[10px] text-neutral-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-neutral-800/40"></div>
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <div className="w-3 h-3 rounded bg-red-400/70"></div>
          <div className="w-3 h-3 rounded bg-neutral-700"></div>
          <div className="w-3 h-3 rounded bg-emerald-400/70"></div>
          <div className="w-3 h-3 rounded bg-emerald-500"></div>
        </div>
        <span>More</span>
      </div>

      {/* Modal */}
      {selectedDayData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {new Date(selectedDayData.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    selectedDayData.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {selectedDayData.pnl >= 0 ? '+' : ''}₹
                  {selectedDayData.pnl.toLocaleString('en-IN')}
                  <span className="text-sm ml-2">
                    ({selectedDayData.pnlPercent >= 0 ? '+' : ''}
                    {selectedDayData.pnlPercent.toFixed(2)}%)
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neutral-400 mb-3">
                {selectedDayData.tradeCount} Trades • Win Rate: {selectedDayData.winRate.toFixed(1)}%
              </h4>
              {selectedDayData.trades.map((trade: Trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white">{trade.tradingsymbol}</p>
                    <p className="text-xs text-neutral-400">
                      {trade.transaction_type} × {trade.quantity} @ ₹
                      {(trade.average_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <p
                    className={`font-semibold ${
                      (trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {(trade.pnl || 0) >= 0 ? '+' : ''}₹
                    {(trade.pnl || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
