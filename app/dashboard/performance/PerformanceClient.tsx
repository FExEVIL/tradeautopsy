'use client'

import { useState } from 'react'
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Activity, 
  Target, 
  BarChart3,
  Ban,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import type { Trade } from '@/types/trade'
import { PnLIndicator } from '@/components/PnLIndicator'
import { formatINR } from '@/lib/formatters'
import { TagAnalytics } from '../components/TagAnalytics'
import { TimePatterns } from '../components/TimePatterns'
import { StreakTracking } from '../components/StreakTracking'

type Props = {
  trades: Trade[]
  metrics: {
    totalTrades: number
    winRate: number
    totalPnL: number
    avgWin: number
    avgLoss: number
    profitFactor: number
    riskRewardRatio?: number
    maxDrawdown: number
    equityCurve: { date: string; equity: number }[]
    dailyPnL: { [date: string]: number }
  }
}

// --- METRIC CARD ---
function MetricCard({ label, value, subtext, icon: Icon, trend }: any) {
  const isPositive = trend === 'up'
  const colorClass = isPositive ? 'text-green-400' : 'text-red-400'
  const bgClass = isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
  const isNeutral = trend === 'neutral'
  
  return (
    <div className="p-5 rounded-xl bg-[#0F0F0F] border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${isNeutral ? 'bg-blue-500/10' : bgClass}`}>
          <Icon className={`w-4 h-4 ${isNeutral ? 'text-blue-400' : colorClass}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtext && <div className="text-[10px] text-gray-500">{subtext}</div>}
    </div>
  )
}

// --- MONTHLY HEATMAP ---
function MonthlyHeatmap({ dailyPnL }: { dailyPnL: { [date: string]: number } }) {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; pnl: number } | null>(null)

  // Generate last 91 days (13 weeks x 7 days approx)
  const days: { date: string; pnl: number }[] = []
  const today = new Date()
  
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateKey = d.toISOString().split('T')[0]
    days.push({
      date: dateKey,
      pnl: dailyPnL[dateKey] || 0
    })
  }

  const getColor = (pnl: number) => {
    if (pnl === 0) return 'bg-[#1A1A1A]'
    if (pnl > 0) {
      if (pnl > 5000) return 'bg-green-500'
      if (pnl > 2000) return 'bg-green-600'
      if (pnl > 500) return 'bg-green-700'
      return 'bg-green-900'
    } else {
      if (pnl < -5000) return 'bg-red-500'
      if (pnl < -2000) return 'bg-red-600'
      if (pnl < -500) return 'bg-red-700'
      return 'bg-red-900'
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap gap-1 justify-center md:justify-start">
        {days.map((day, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-sm ${getColor(day.pnl)} hover:ring-2 hover:ring-white/40 transition-all cursor-pointer`}
            onMouseEnter={() => setHoveredCell(day)}
            onMouseLeave={() => setHoveredCell(null)}
          />
        ))}
      </div>

      {hoveredCell && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#0F0F0F] border border-white/10 rounded-lg p-3 shadow-xl z-50 whitespace-nowrap pointer-events-none">
          <div className="text-xs text-gray-400 mb-1">
            {new Date(hoveredCell.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <PnLIndicator value={hoveredCell.pnl} size="sm" />
        </div>
      )}
    </div>
  )
}

export default function PerformanceClient({ trades, metrics }: Props) {
  if (!trades || trades.length === 0) {
        return (
          <div className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-center">
            <div className="text-center max-w-md border border-dashed border-white/10 p-12 rounded-2xl bg-[#0F0F0F]">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ban className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Performance Data Yet</h2>
          <p className="text-gray-400 text-sm mb-6">
            Import your trades or add a manual entry to generate your equity curve and win rate analysis.
          </p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F0F0F] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <PnLIndicator value={payload[0].value} size="sm" />
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Deep dive into your trading metrics and equity growth.</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total P&L</span>
              <div className={`p-2 rounded-lg ${metrics.totalPnL >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <DollarSign className={`w-4 h-4 ${metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </div>
            <PnLIndicator value={metrics.totalPnL} size="lg" />
            <div className="text-[10px] text-gray-500 mt-1">Net cumulative profit</div>
          </div>
          
          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Win Rate</span>
              <div className={`p-2 rounded-lg ${metrics.winRate > 50 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <Target className={`w-4 h-4 ${metrics.winRate > 50 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metrics.winRate.toFixed(1)}%</div>
            <div className="text-[10px] text-gray-500">
              {trades.filter(t => (t.pnl || 0) > 0).length} wins / {trades.length} trades
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Avg Profit</span>
              <div className={`p-2 rounded-lg ${metrics.avgWin > 0 ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                <ArrowUp className={`w-4 h-4 ${metrics.avgWin > 0 ? 'text-green-400' : 'text-gray-400'}`} />
              </div>
            </div>
            {metrics.avgWin > 0 ? (
              <PnLIndicator value={metrics.avgWin} size="lg" />
            ) : (
              <div className="text-2xl font-bold text-gray-500">—</div>
            )}
            <div className="text-[10px] text-gray-500 mt-1">Per winning trade</div>
          </div>

          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Avg Loss</span>
              <div className={`p-2 rounded-lg ${metrics.avgLoss < 0 ? 'bg-red-500/10' : 'bg-gray-500/10'}`}>
                <ArrowDown className={`w-4 h-4 ${metrics.avgLoss < 0 ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
            </div>
            {metrics.avgLoss < 0 ? (
              <PnLIndicator value={metrics.avgLoss} size="lg" />
            ) : (
              <div className="text-2xl font-bold text-gray-500">—</div>
            )}
            <div className="text-[10px] text-gray-500 mt-1">Per losing trade</div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Profit Factor</span>
              <div className={`p-2 rounded-lg ${metrics.profitFactor > 1.5 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <Activity className={`w-4 h-4 ${metrics.profitFactor > 1.5 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metrics.profitFactor.toFixed(2)}</div>
            <div className="text-[10px] text-gray-500">Gross Profit / Gross Loss</div>
          </div>

          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Risk-Reward Ratio</span>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            {metrics.riskRewardRatio !== undefined && metrics.riskRewardRatio > 0 ? (
              <div className="text-2xl font-bold text-white mb-1">
                1 : {metrics.riskRewardRatio.toFixed(2)}
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-500">—</div>
            )}
            <div className="text-[10px] text-gray-500">Avg Win / Avg Loss</div>
          </div>

          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Max Drawdown</span>
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
            </div>
            <PnLIndicator value={-metrics.maxDrawdown} size="lg" />
            <div className="text-[10px] text-gray-500 mt-1">Maximum peak-to-trough decline</div>
          </div>
        </div>

        {/* Equity Curve */}
        <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5 h-[450px] relative group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Equity Curve
            </h3>
          </div>
          
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={metrics.equityCurve}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.4} />
              <XAxis 
                dataKey="date" 
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
                tickFormatter={(val) => formatINR(val, { compact: true })}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="#22c55e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorEquity)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Advanced Stats & Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Risk Analysis */}
           <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">Risk Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                   <span className="text-xs text-gray-400">Largest Win</span>
                   <PnLIndicator 
                     value={Math.max(...trades.map(t => t.pnl || 0), 0)} 
                     size="sm" 
                   />
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                   <span className="text-xs text-gray-400">Largest Loss</span>
                   <PnLIndicator 
                     value={Math.min(...trades.map(t => t.pnl || 0), 0)} 
                     size="sm" 
                   />
                </div>
              </div>
           </div>

           {/* Heatmap */}
           <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Daily P&L Heatmap</h3>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Last 90 Days</span>
              </div>
              
              <div className="flex-1 flex items-center">
                 <MonthlyHeatmap dailyPnL={metrics.dailyPnL} />
              </div>

              <div className="flex items-center justify-between mt-4 text-[10px] text-gray-500 border-t border-white/5 pt-3">
                <span>Less Active</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-3 bg-[#1A1A1A] rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                </div>
                <span>High Profit</span>
              </div>
           </div>
        </div>

        {/* Behavioral & Time-based Insights */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Behavioral & Time Patterns</h2>
          
          {/* Streak Tracking */}
          <StreakTracking trades={trades} />

          {/* Tag Analytics */}
          <TagAnalytics trades={trades} />

          {/* Time Patterns */}
          <TimePatterns trades={trades} />
        </div>

    </div>
  )
}
