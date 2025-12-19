'use client'

import { useMemo } from 'react'
import { TradeLeg, PayoffDiagram } from '@/types/backtesting'
import { calculatePayoff } from '@/lib/backtesting/payoff'
import { Card } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown, Target } from 'lucide-react'

interface PayoffDiagramProps {
  legs: TradeLeg[]
  currentPrice: number
  priceRange?: { min: number; max: number; step: number }
}

export function PayoffDiagram({ legs, currentPrice, priceRange }: PayoffDiagramProps) {
  const payoff = useMemo(() => {
    if (legs.length === 0 || currentPrice <= 0) return null
    return calculatePayoff(legs, currentPrice, priceRange)
  }, [legs, currentPrice, priceRange])

  if (!payoff) {
    return (
      <Card variant="darker" className="text-center py-8">
        <p className="text-gray-400">Add strategy legs to view payoff diagram</p>
      </Card>
    )
  }

  const chartData = payoff.points.map(p => ({
    price: p.underlyingPrice,
    pnl: p.pnl,
  }))

  const maxProfitColor = payoff.maxProfit > 0 ? 'text-green-400' : 'text-gray-400'
  const maxLossColor = payoff.maxLoss < 0 ? 'text-red-400' : 'text-gray-400'
  const currentPnLColor = payoff.currentPnL >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <Card variant="darker">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">Payoff Diagram</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-gray-400">P&L</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-gray-400">Current Price</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
              <XAxis 
                dataKey="price" 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <YAxis 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 shadow-lg">
                        <p className="text-xs text-gray-400">Price: ₹{payload[0].payload.price}</p>
                        <p className={`text-sm font-semibold ${payload[0].value && payload[0].value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          P&L: ₹{payload[0].value?.toFixed(2)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
                cursor={{ stroke: '#ffffff20' }}
              />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine 
                x={currentPrice} 
                stroke="#fbbf24" 
                strokeDasharray="2 2" 
                opacity={0.7}
                label={{ value: 'Current', position: 'top', fill: '#fbbf24', fontSize: 10 }}
              />
              <Line 
                type="monotone" 
                dataKey="pnl" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/5">
          <div className="p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <p className="text-xs text-gray-400">Max Profit</p>
            </div>
            <p className={`text-sm font-bold ${maxProfitColor}`}>
              ₹{payoff.maxProfit.toFixed(2)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              <p className="text-xs text-gray-400">Max Loss</p>
            </div>
            <p className={`text-sm font-bold ${maxLossColor}`}>
              ₹{payoff.maxLoss.toFixed(2)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-xs text-gray-400">Current P&L</p>
            </div>
            <p className={`text-sm font-bold ${currentPnLColor}`}>
              ₹{payoff.currentPnL.toFixed(2)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-gray-400 mb-1">Risk/Reward</p>
            <p className="text-sm font-bold text-gray-300">
              {payoff.riskRewardRatio > 0 ? `1:${payoff.riskRewardRatio.toFixed(2)}` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Breakevens */}
        {payoff.breakevens.length > 0 && (
          <div className="pt-3 border-t border-white/5">
            <p className="text-xs text-gray-400 mb-2">Breakeven Points</p>
            <div className="flex flex-wrap gap-2">
              {payoff.breakevens.map((be, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400"
                >
                  ₹{be}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
