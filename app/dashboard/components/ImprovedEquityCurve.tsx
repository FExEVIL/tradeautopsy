'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'

interface Trade {
  pnl: number
  trade_date: string | null
}

interface ImprovedEquityCurveProps {
  trades: Trade[]
}

export function ImprovedEquityCurve({ trades }: ImprovedEquityCurveProps) {
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | 'ALL'>('1M')
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = a.trade_date ? new Date(a.trade_date).getTime() : 0
    const dateB = b.trade_date ? new Date(b.trade_date).getTime() : 0
    return dateA - dateB
  })

  // Calculate cumulative P&L
  let cumulative = 0
  const data = sortedTrades.map((trade, i) => {
    cumulative += trade.pnl || 0
    return {
      index: i,
      date: trade.trade_date,
      value: cumulative,
      pnl: trade.pnl || 0
    }
  })

  const totalPnL = data.length > 0 ? data[data.length - 1].value : 0
  const maxValue = Math.max(...data.map(d => d.value), 0)
  const minValue = Math.min(...data.map(d => d.value), 0)

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 hover-lift animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Equity Curve
            <span className="text-sm font-normal text-gray-500">(Your journey)</span>
          </h3>
          <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-1">
          {(['1W', '1M', '3M', 'ALL'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-80 bg-black/20 rounded-xl p-6 overflow-hidden">
        {/* Grid Lines */}
        <div className="absolute inset-0 p-6">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="absolute left-6 right-6 border-t border-gray-800/50"
              style={{ top: `${6 + (percent * 0.82)}%` }}
            >
              <span className="absolute -left-4 -top-2 text-xs text-gray-600">
                ₹{(maxValue - (maxValue - minValue) * (percent / 100)).toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        {/* Line Chart */}
        {data.length > 1 && (
          <svg className="relative z-10 w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={totalPnL >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={totalPnL >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area under curve */}
            <path
              d={`M 0 300 ${data.map((d, i) => {
                const x = (i / (data.length - 1)) * 1000
                const y = 300 - ((d.value - minValue) / (maxValue - minValue || 1)) * 300
                return `L ${x} ${y}`
              }).join(' ')} L 1000 300 Z`}
              fill="url(#gradient)"
            />

            {/* Line */}
            <polyline
              points={data.map((d, i) => {
                const x = (i / (data.length - 1)) * 1000
                const y = 300 - ((d.value - minValue) / (maxValue - minValue || 1)) * 300
                return `${x},${y}`
              }).join(' ')}
              fill="none"
              stroke={totalPnL >= 0 ? '#10b981' : '#ef4444'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 1000
              const y = 300 - ((d.value - minValue) / (maxValue - minValue || 1)) * 300
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={d.pnl >= 0 ? '#10b981' : '#ef4444'}
                  className="cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              )
            })}
          </svg>
        )}

        {/* Hover Tooltip */}
        {hoveredPoint !== null && data[hoveredPoint] && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/90 border border-gray-700 rounded-lg px-4 py-2 text-sm z-20">
            <p className="text-gray-400 mb-1">
              {data[hoveredPoint].date 
                ? new Date(data[hoveredPoint].date!).toLocaleDateString('en-IN')
                : 'N/A'}
            </p>
            <p className={`font-bold ${data[hoveredPoint].value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{data[hoveredPoint].value.toFixed(2)}
            </p>
          </div>
        )}

        {/* Empty State */}
        {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-600">No data to display</p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Peak</p>
          <p className="text-lg font-bold text-green-400">₹{maxValue.toFixed(0)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Trough</p>
          <p className="text-lg font-bold text-red-400">₹{minValue.toFixed(0)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Current</p>
          <p className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ₹{totalPnL.toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  )
}
