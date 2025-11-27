'use client'

interface Trade {
  trade_date: string
  pnl: number | null
}

export function DailyPnLChart({ trades }: { trades: Trade[] }) {
  // Group trades by date and sum P&L
  const dailyPnL = trades.reduce((acc, trade) => {
    const date = new Date(trade.trade_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    acc[date] = (acc[date] || 0) + (trade.pnl || 0)
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(dailyPnL).map(([date, pnl]) => ({ date, pnl }))
  
  const maxPnL = Math.max(...data.map(d => Math.abs(d.pnl)))
  const wins = data.filter(d => d.pnl > 0).length
  const losses = data.filter(d => d.pnl < 0).length
  const totalDays = data.length

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">Daily P&L</h2>
      
      <div className="relative h-80">
        <svg className="w-full h-full" viewBox="0 0 800 320">
          {/* Zero line */}
          <line
            x1="60"
            y1="160"
            x2="780"
            y2="160"
            stroke="#6b7280"
            strokeWidth="2"
          />

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="60"
              y1={60 + i * 50}
              x2="780"
              y2={60 + i * 50}
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const barWidth = Math.min(720 / data.length - 4, 40)
            const x = 60 + (i / data.length) * 720 + (720 / data.length - barWidth) / 2
            const barHeight = (Math.abs(d.pnl) / maxPnL) * 100
            const y = d.pnl >= 0 ? 160 - barHeight : 160
            
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={d.pnl >= 0 ? '#10b981' : '#ef4444'}
                  opacity="0.8"
                  rx="2"
                />
              </g>
            )
          })}

          {/* Y-axis labels */}
          {[maxPnL, maxPnL / 2, 0, -maxPnL / 2, -maxPnL].map((val, i) => (
            <text
              key={i}
              x="50"
              y={60 + i * 50}
              textAnchor="end"
              fill="#9ca3af"
              fontSize="12"
            >
              ₹{val.toFixed(0)}
            </text>
          ))}

          {/* X-axis labels */}
          {data.filter((_, i) => i % Math.ceil(data.length / 10) === 0).map((d, i) => {
            const originalIndex = data.indexOf(d)
            const x = 60 + (originalIndex / data.length) * 720 + 720 / data.length / 2
            return (
              <text
                key={i}
                x={x}
                y="290"
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
              >
                {d.date}
              </text>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Winning Days</p>
          <p className="text-2xl font-bold text-emerald-400">{wins}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Losing Days</p>
          <p className="text-2xl font-bold text-red-400">{losses}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Win Rate</p>
          <p className="text-2xl font-bold text-white">
            {totalDays > 0 ? ((wins / totalDays) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>
    </div>
  )
}
