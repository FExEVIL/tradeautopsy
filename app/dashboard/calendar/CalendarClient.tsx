'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { PnLIndicator } from '@/components/PnLIndicator'
import { formatINR } from '@/lib/formatters'

type DayData = { pnl: number; trades: any[]; count: number }
type Props = { dailyData: { [date: string]: DayData } }

export default function CalendarClient({ dailyData = {} }: Props) { // Default to {}
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<{ date: string; data: DayData } | null>(null)

  // Navigation
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

  // Generate calendar grid
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  // Fix for first day of month (0 = Sunday, 1 = Monday... we want Mon start)
  const firstDay = new Date(year, month, 1).getDay()
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1 // Adjust so Mon is 0
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays = []
  for (let i = 0; i < adjustedFirstDay; i++) calendarDays.push(null) // Empty cells
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day)

  // Get color intensity based on P&L
  const getColor = (pnl: number) => {
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
  }

  // Monthly stats
  const safeData = dailyData || {} // Extra safety check
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthDays = Object.entries(safeData).filter(([date]) => date.startsWith(monthKey))
  const monthPnL = monthDays.reduce((sum, [_, data]) => sum + data.pnl, 0)
  const winDays = monthDays.filter(([_, data]) => data.pnl > 0).length
  const loseDays = monthDays.filter(([_, data]) => data.pnl < 0).length
  const winRate = monthDays.length > 0 ? (winDays / monthDays.length) * 100 : 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 space-y-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-end justify-between">
           <div>
             <h1 className="text-3xl font-bold text-white">Trading Calendar</h1>
             <p className="text-gray-400 text-sm mt-1">Visual overview of your daily P&L performance</p>
           </div>
        </div>

        {/* Monthly Stats */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="p-4 rounded-xl bg-[#0F0F0F] border border-white/5">
              <div className="text-gray-400 text-xs uppercase mb-1">Monthly P&L</div>
              <PnLIndicator value={monthPnL} size="lg" />
           </div>
           <div className="p-4 rounded-xl bg-[#0F0F0F] border border-white/5">
              <div className="text-gray-400 text-xs uppercase mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
           </div>
           <div className="p-4 rounded-xl bg-[#0F0F0F] border border-white/5">
              <div className="text-gray-400 text-xs uppercase mb-1">Green Days</div>
              <div className="text-2xl font-bold text-green-400">{winDays}</div>
           </div>
           <div className="p-4 rounded-xl bg-[#0F0F0F] border border-white/5">
              <div className="text-gray-400 text-xs uppercase mb-1">Red Days</div>
              <div className="text-2xl font-bold text-red-400">{loseDays}</div>
           </div>
        </div>

        {/* Calendar */}
        <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Profit Calendar</h2>
              <div className="flex items-center gap-4">
                 <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                 </button>
                 <span className="text-white font-semibold min-w-[150px] text-center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                 </span>
                 <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
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
           <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                 if (!day) return <div key={idx} className="aspect-square" />
                 
                 const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                 const dayData = safeData[dateKey]
                 const pnl = dayData?.pnl || 0

                 return (
                    <button
                       key={idx}
                       onClick={() => dayData && setSelectedDay({ date: dateKey, data: dayData })}
                       className={`aspect-square rounded-lg ${getColor(pnl)} hover:ring-2 hover:ring-white/30 transition-all flex flex-col items-center justify-center p-2 relative group`}
                    >
                       <span className="text-xs text-white font-medium">{day}</span>
                       {dayData && (
                          <span className="text-[10px] font-mono text-white/90">
                             {formatINR(pnl, { compact: true })}
                          </span>
                       )}
                    </button>
                 )
              })}
           </div>
           
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
    </div>
  )
}
