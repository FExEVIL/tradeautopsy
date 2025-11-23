'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Trade {
  trade_date: string | null
  pnl: number
}

interface PnLByDayProps {
  trades: Trade[]
}

export function PnLByDay({ trades }: PnLByDayProps) {
  const tradesWithDates = trades.filter(t => t.trade_date)

  if (tradesWithDates.length === 0) return null

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayStats = tradesWithDates.reduce((acc, trade) => {
    const dayIndex = new Date(trade.trade_date!).getDay()
    const dayName = dayNames[dayIndex]
    
    if (!acc[dayName]) {
      acc[dayName] = { pnl: 0, count: 0 }
    }
    acc[dayName].pnl += trade.pnl || 0
    acc[dayName].count += 1
    return acc
  }, {} as Record<string, { pnl: number; count: number }>)

  const chartData = dayNames.map(day => ({
    day: day.substring(0, 3),
    pnl: dayStats[day]?.pnl || 0,
    count: dayStats[day]?.count || 0
  }))

  return (
    <div className="nano app/dashboard/components/PnLByDay.tsx p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">P&L by Day of Week</h2>
          <p className="text-sm text-gray-400">Which days are most profitable</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: any, name: string, props: any) => [
                `₹${value.toFixed(2)}`,
                `P&L (${props.payload.count} trades)`
              ]}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#34D399' : '#F87171'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
