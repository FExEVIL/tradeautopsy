import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, Cell, Legend
} from 'recharts'
import { 
  TrendingUp, BarChart3, AlertTriangle, Clock, Calendar
} from 'lucide-react'
import type { Trade } from '@/types/trade'

type Props = {
  trades: Trade[]
  metrics: {
    totalPnL: number
    peakPnL: number
    winRate: number
    equityCurve: { date: string; equity: number }[]
    dailyPnL: { [date: string]: number }
  }
}

export default function ChartsClient({ trades, metrics }: Props) {
  // --- DATA PROCESSING ---

  // 1. Daily P&L
  const dailyPnLArray = Object.entries(metrics.dailyPnL)
    .map(([date, pnl]) => ({
      date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      pnl,
      rawDate: new Date(date)
    }))
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())

  const winningDays = dailyPnLArray.filter(d => d.pnl > 0).length
  const losingDays = dailyPnLArray.filter(d => d.pnl < 0).length

  // 2. Drawdown Calculation
  let currentPeak = -Infinity
  const drawdownData = metrics.equityCurve.map(point => {
    if (point.equity > currentPeak) currentPeak = point.equity
    const drawdown = currentPeak > 0 ? ((currentPeak - point.equity) / currentPeak) * 100 : 0
    return { ...point, drawdown: drawdown > 0 ? -drawdown : 0 } // Negative for chart
  })

  // 3. Weekday Performance
  const weekdayMap: {[key: string]: number} = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 }
  trades.forEach(t => {
    const day = new Date(t.trade_date || new Date()).toLocaleDateString('en-US', { weekday: 'short' })
    if (weekdayMap[day] !== undefined) weekdayMap[day] += (t.pnl || 0)
  })
  const weekdayData = Object.entries(weekdayMap).map(([day, pnl]) => ({ day, pnl }))

  // --- TOOLTIPS ---
  const CurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F0F0F] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className={`text-sm font-mono font-bold ${payload[0].value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  const PercentTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F0F0F] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-sm font-mono font-bold text-red-400">
            {payload[0].value.toFixed(2)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 space-y-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Chart Analysis</h1>
            <p className="text-gray-400 text-sm mt-1">Advanced visualizations of your trading performance.</p>
          </div>
          <div className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-gray-400">
             Total Trades: <span className="text-white font-bold">{trades.length}</span>
          </div>
        </div>

        {/* ROW 1: Equity & Daily P&L (Existing) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Equity Curve */}
           <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5 relative group h-[400px]">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-blue-500" /> Equity Curve
                 </h2>
                 <span className={`font-mono font-bold ${metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{metrics.totalPnL.toLocaleString()}
                 </span>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={metrics.equityCurve}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} minTickGap={30}/>
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`}/>
                  <Tooltip content={<CurrencyTooltip />} cursor={{ stroke: '#ffffff20' }} />
                  <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" opacity={0.5} />
                  <Area type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>

           {/* Daily P&L */}
           <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5 relative group h-[400px]">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                   <BarChart3 className="w-4 h-4 text-purple-500" /> Daily P&L
                 </h2>
                 <div className="flex gap-2 text-xs">
                    <span className="text-green-400">{winningDays} Green</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-red-400">{losingDays} Red</span>
                 </div>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={dailyPnLArray}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`}/>
                  <Tooltip content={<CurrencyTooltip />} cursor={{ fill: '#ffffff05' }} />
                  <ReferenceLine y={0} stroke="#666" opacity={0.5} />
                  <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
                    {dailyPnLArray.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* ROW 2: Advanced Analytics (NEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Drawdown Chart */}
           <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5 lg:col-span-2 h-[350px]">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                   <AlertTriangle className="w-4 h-4 text-orange-500" /> Drawdown %
                 </h2>
                 <span className="text-xs text-gray-500">From Peak Equity</span>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={drawdownData}>
                  <defs>
                    <linearGradient id="colorDD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} minTickGap={30}/>
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`}/>
                  <Tooltip content={<PercentTooltip />} />
                  <Area type="step" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fill="url(#colorDD)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>

           {/* Weekday Performance */}
           <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5 h-[350px]">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                   <Calendar className="w-4 h-4 text-yellow-500" /> Day of Week
                 </h2>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={weekdayData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="day" type="category" stroke="#999" fontSize={12} tickLine={false} axisLine={false} width={40}/>
                  <Tooltip content={<CurrencyTooltip />} cursor={{ fill: '#ffffff05' }} />
                  <Bar dataKey="pnl" radius={[0, 4, 4, 0]} barSize={30}>
                    {weekdayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#eab308' : '#71717a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>

        </div>

      </div>
    </div>
  )
}