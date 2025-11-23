'use client'

interface Trade {
  exchange_timestamp: string | null
  pnl: number
}

interface TimeOfDayChartProps {
  trades: Trade[]
}

export function TimeOfDayChart({ trades }: TimeOfDayChartProps) {
  const tradesWithTime = trades.filter(t => t.exchange_timestamp)

  if (tradesWithTime.length === 0) return null

  const hourStats = tradesWithTime.reduce((acc, trade) => {
    const hour = new Date(trade.exchange_timestamp!).getHours()
    if (!acc[hour]) {
      acc[hour] = { pnl: 0, count: 0 }
    }
    acc[hour].pnl += trade.pnl || 0
    acc[hour].count += 1
    return acc
  }, {} as Record<number, { pnl: number; count: number }>)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const hourData = hours.map(hour => ({
    hour,
    pnl: hourStats[hour]?.pnl || 0,
    count: hourStats[hour]?.count || 0
  }))

  const maxPnL = Math.max(...hourData.map(d => Math.abs(d.pnl)))

  const getColor = (pnl: number, count: number) => {
    if (count === 0) return 'bg-gray-800/30'
    const intensity = Math.abs(pnl) / maxPnL
    if (pnl > 0) {
      if (intensity > 0.66) return 'bg-green-500/80'
      if (intensity > 0.33) return 'bg-green-500/50'
      return 'bg-green-500/30'
    } else {
      if (intensity > 0.66) return 'bg-red-500/80'
      if (intensity > 0.33) return 'bg-red-500/50'
      return 'bg-red-500/30'
    }
  }

  return (
    <div className="nano app/dashboard/components/TimeOfDayChart.tsx p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Trading Performance by Hour</h2>
          <p className="text-sm text-gray-400">Best and worst trading times</p>
        </div>
      </div>

      <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
        {hourData.map(({ hour, pnl, count }) => (
          <div
            key={hour}
            className={`aspect-square ${getColor(pnl, count)} border border-white/10 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-110 cursor-pointer group relative`}
          >
            <span className="text-xs font-bold text-white">{hour}:00</span>
            
            {count > 0 && (
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 border border-white/10 rounded-lg p-2 text-xs whitespace-nowrap z-10">
                <p className="text-gray-300">Hour: {hour}:00 - {hour + 1}:00</p>
                <p className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                  P&L: ₹{pnl.toFixed(2)}
                </p>
                <p className="text-gray-400">{count} trades</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/80 rounded"></div>
          <span>High Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800/30 rounded"></div>
          <span>No Trades</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/80 rounded"></div>
          <span>High Profit</span>
        </div>
      </div>
    </div>
  )
}