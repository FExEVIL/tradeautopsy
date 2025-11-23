'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Trade {
  trade_date: string | null
  pnl: number
}

interface EquityCurveProps {
  trades: Trade[]
}

export function EquityCurve({ trades }: EquityCurveProps) {
  const sortedTrades = [...trades]
    .filter(t => t.trade_date)
    .sort((a, b) => new Date(a.trade_date!).getTime() - new Date(b.trade_date!).getTime())

  let cumulative = 0
  const equityData = sortedTrades.map(trade => {
    cumulative += trade.pnl || 0
    return {
      date: new Date(trade.trade_date!).toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      }),
      equity: cumulative
    }
  })

  if (equityData.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Equity Curve</h2>
        </div>
        <p className="text-gray-400 text-center py-8">No trade data available</p>
      </div>
    )
  }

  const finalEquity = equityData[equityData.length - 1].equity
  const isProfit = finalEquity >= 0

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Equity Curve</h2>
            <p className="text-sm text-gray-400">Cumulative P&L over time</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-400">Total P&L</p>
          <p className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            ₹{finalEquity.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={equityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
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
              formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Equity']}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Line 
              type="monotone" 
              dataKey="equity" 
              stroke={isProfit ? '#34D399' : '#F87171'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: isProfit ? '#34D399' : '#F87171' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}