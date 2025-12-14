'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { formatINR } from '@/lib/formatters'
import { format } from 'date-fns'

export function DailyEquityCurve({ trades }: { trades: any[] }) {
  const chartData = useMemo(() => {
    let cumulativePnL = 0
    const dataPoints = trades.map((trade, idx) => {
      cumulativePnL += parseFloat(String(trade.pnl || 0))
      const tradeTime = trade.created_at 
        ? format(new Date(trade.created_at), 'HH:mm')
        : `${idx + 1}`
      
      return {
        time: tradeTime,
        equity: cumulativePnL,
        index: idx + 1
      }
    })

    return dataPoints
  }, [trades])

  const lastPnL = chartData.length > 0 ? chartData[chartData.length - 1].equity : 0

  const CurrencyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F0F0F] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-xs text-gray-500 mb-1">{payload[0].payload.time}</p>
          <p className={`text-sm font-mono font-bold ${payload[0].value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatINR(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-500/20">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Equity Curve</h3>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Final P&L</div>
          <div className={`text-xl font-bold ${lastPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {lastPnL >= 0 ? '+' : ''}{formatINR(lastPnL)}
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#666" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#666" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `₹${(val / 1000).toFixed(1)}K`}
            />
            <Tooltip content={<CurrencyTooltip />} cursor={{ stroke: '#ffffff20' }} />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" opacity={0.5} />
            <Area 
              type="monotone" 
              dataKey="equity" 
              stroke="#10b981" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorEquity)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
