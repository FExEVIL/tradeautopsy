'use client'

interface Trade {
  trade_date: string
  pnl: number | null
}

export function EquityCurveChart({ trades }: { trades: Trade[] }) {
  // Calculate cumulative P&L
  let cumulative = 0
  const data = trades.map(trade => {
    cumulative += trade.pnl || 0
    return {
      date: new Date(trade.trade_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      pnl: cumulative
    }
  })

  const maxPnL = Math.max(...data.map(d => d.pnl))
  const minPnL = Math.min(...data.map(d => d.pnl))
  const range = maxPnL - minPnL
  const padding = range * 0.1

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">Equity Curve</h2>
      
      <div className="relative h-80">
        <svg className="w-full h-full" viewBox="0 0 800 320">
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

          {/* Equity line */}
          <polyline
            points={data.map((d, i) => {
              const x = 60 + (i / (data.length - 1)) * 720
              const y = 260 - ((d.pnl - minPnL + padding) / (range + 2 * padding)) * 200
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
          />

          {/* Points */}
          {data.map((d, i) => {
            const x = 60 + (i / (data.length - 1)) * 720
            const y = 260 - ((d.pnl - minPnL + padding) / (range + 2 * padding)) * 200
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#10b981"
              />
            )
          })}

          {/* Y-axis labels */}
          {[maxPnL, maxPnL * 0.5, 0, minPnL * 0.5, minPnL].map((val, i) => (
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

          {/* X-axis labels (show every nth label to avoid crowding) */}
          {data.filter((_, i) => i % Math.ceil(data.length / 10) === 0).map((d, i, arr) => {
            const originalIndex = data.indexOf(d)
            const x = 60 + (originalIndex / (data.length - 1)) * 720
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
          <p className="text-gray-400 text-sm">Final P&L</p>
          <p className={`text-2xl font-bold ${cumulative >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {cumulative >= 0 ? '+' : ''}₹{cumulative.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Peak P&L</p>
          <p className="text-2xl font-bold text-white">₹{maxPnL.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Lowest P&L</p>
          <p className="text-2xl font-bold text-white">₹{minPnL.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
