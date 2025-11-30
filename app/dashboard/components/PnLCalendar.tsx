
'use client'

import { useState } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { Trade } from '@/types/trade'
import { aggregateTradesByDay, getColorClass } from '@/lib/calendar-utils'
import { X } from 'lucide-react'

interface PnLCalendarProps {
  trades: Trade[]
}

export default function PnLCalendar({ trades }: PnLCalendarProps) {
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year')
  const [selectedDay, setSelectedDay] = useState<any>(null)

  const dailyData = aggregateTradesByDay(trades)

  const now = new Date()
  const startDate = viewMode === 'year' 
    ? new Date(now.getFullYear(), 0, 1)
    : new Date(now.getFullYear(), now.getMonth(), 1)
  
  const endDate = viewMode === 'year'
    ? new Date(now.getFullYear(), 11, 31)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const values = dailyData.map((day) => ({
    date: day.date,
    count: day.pnl,
    trades: day.trades,
    tradeCount: day.count,
  }))

  
   return (
 <div className="bg-neutral-900 rounded-xl px-6 py-5 border border-gray-800">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">P&L Calendar</h2>
          <p className="text-sm text-gray-400 mt-1">
            {viewMode === 'year' ? 'Yearly' : 'Monthly'} trading performance heatmap
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'year'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Year
          </button>
        </div>
      </div>
<div className="mt-4 flex justify-center">
  <div className="w-full max-w-3xl">
    <CalendarHeatmap
      startDate={startDate}
      endDate={endDate}
      values={values}
      classForValue={(value: any) => {
        if (!value || value.count === 0) return 'color-empty'
        return getColorClass(value.count)
      }}
      tooltipDataAttrs={(value: any) => {
        if (!value || !value.date) {
          return { 'data-tip': '' }
        }
        const date = new Date(value.date).toLocaleDateString('en-IN')
        const pnl = (value.count || 0).toLocaleString('en-IN')
        const count = value.tradeCount || 0
        return {
          'data-tip': `${date}: ₹${pnl} (${count} trades)`
        }
      }}
      onClick={(value: any) => {
        if (value && value.trades) {
          setSelectedDay(value)
        }
      }}
      showWeekdayLabels={false}
      horizontal={false}
      gutterSize={2}
    />
  </div>
</div>



      {/* Color Legend */}
      <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-gray-800 rounded"></div>
          <div className="w-4 h-4 rounded color-loss-1"></div>
          <div className="w-4 h-4 rounded color-loss-2"></div>
          <div className="w-4 h-4 rounded color-loss-3"></div>
          <div className="w-4 h-4 rounded color-loss-4"></div>
          <div className="w-4 h-4 rounded color-profit-1"></div>
          <div className="w-4 h-4 rounded color-profit-2"></div>
          <div className="w-4 h-4 rounded color-profit-3"></div>
          <div className="w-4 h-4 rounded color-profit-4"></div>
        </div>
        <span>More</span>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {new Date(selectedDay.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    selectedDay.count >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {selectedDay.count >= 0 ? '+' : ''}₹
                  {selectedDay.count.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                {selectedDay.tradeCount} Trades
              </h4>
              {selectedDay.trades.map((trade: Trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white">{trade.tradingsymbol}</p>
                    <p className="text-xs text-gray-400">
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

      <style jsx global>{`
        .react-calendar-heatmap {
          width: 100%;
        }

    .react-calendar-heatmap rect {
  width: 11px;
  height: 11px;
  rx: 2px;
  ry: 2px;
}
        .react-calendar-heatmap .color-empty {
          fill: #27272a;
        }
        .react-calendar-heatmap .color-profit-1 {
          fill: #10b98133;
        }
        .react-calendar-heatmap .color-profit-2 {
          fill: #10b98166;
        }
        .react-calendar-heatmap .color-profit-3 {
          fill: #10b98199;
        }
        .react-calendar-heatmap .color-profit-4 {
          fill: #10b981;
        }
        .react-calendar-heatmap .color-loss-1 {
          fill: #ef444433;
        }
        .react-calendar-heatmap .color-loss-2 {
          fill: #ef444466;
        }
        .react-calendar-heatmap .color-loss-3 {
          fill: #ef444499;
        }
        .react-calendar-heatmap .color-loss-4 {
          fill: #ef4444;
        }
        .react-calendar-heatmap text {
          fill: #9ca3af;
          font-size: 10px;
        }
        .react-calendar-heatmap rect:hover {
          stroke: #ffffff;
          stroke-width: 2px;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
