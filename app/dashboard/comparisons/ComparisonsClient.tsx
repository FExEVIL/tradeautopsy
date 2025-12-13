'use client'

import { useMemo, useState, useEffect } from 'react'
import { TrendingUp, Calendar, BarChart3, Users, Percent, Loader2 } from 'lucide-react'
import { Trade } from '@/types/trade'
import { compareTimePeriods, calculatePercentileRanking, compareStrategies } from '@/lib/comparison-utils'
import { analyzeByStrategy } from '@/lib/strategy-analysis'
import { classifyTradeStrategy } from '@/lib/strategy-classifier'
import { formatINR } from '@/lib/formatters'
import { PnLIndicator } from '@/components/PnLIndicator'
import { ErrorState } from '../components/ErrorState'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts'

interface ComparisonsClientProps {
  trades: Trade[]
}

export default function ComparisonsClient({ trades }: ComparisonsClientProps) {
  const [selectedStrategy1, setSelectedStrategy1] = useState<string>('Intraday')
  const [selectedStrategy2, setSelectedStrategy2] = useState<string>('Swing')
  const [isCalculating, setIsCalculating] = useState(true)

  useEffect(() => {
    // Simulate calculation time for large datasets
    if (trades.length > 0) {
      const timer = setTimeout(() => setIsCalculating(false), 100)
      return () => clearTimeout(timer)
    } else {
      setIsCalculating(false)
    }
  }, [trades.length])

  const timePeriods = useMemo(() => compareTimePeriods(trades), [trades])
  const strategyMetrics = useMemo(() => analyzeByStrategy(trades), [trades])

  // Calculate overall metrics for percentile
  const overallWinRate = trades.length > 0
    ? (trades.filter(t => parseFloat(String(t.pnl || '0')) > 0).length / trades.length) * 100
    : 0
  const totalPnL = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
  const wins = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0)
  const losses = trades.filter(t => parseFloat(String(t.pnl || '0')) < 0)
  const grossProfit = wins.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0))
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0
  const sharpeRatio = 1.2 // Simplified - would need actual calculation

  const percentile = useMemo(() => 
    calculatePercentileRanking(overallWinRate, profitFactor, sharpeRatio),
    [overallWinRate, profitFactor, sharpeRatio]
  )

  // Strategy comparison
  const strategy1Trades = trades.filter(t => 
    classifyTradeStrategy({
      product: t.product || 'MIS',
      tradingsymbol: t.tradingsymbol || '',
      transaction_type: t.transaction_type || 'BUY',
      trade_date: t.trade_date || null
    }) === selectedStrategy1
  )
  const strategy2Trades = trades.filter(t =>
    classifyTradeStrategy({
      product: t.product || 'MIS',
      tradingsymbol: t.tradingsymbol || '',
      transaction_type: t.transaction_type || 'BUY',
      trade_date: t.trade_date || null
    }) === selectedStrategy2
  )

  const strategyComparison = useMemo(() =>
    compareStrategies(strategy1Trades, strategy2Trades, selectedStrategy1, selectedStrategy2),
    [strategy1Trades, strategy2Trades, selectedStrategy1, selectedStrategy2]
  )

  if (isCalculating) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-400 animate-spin" />
          <p className="text-gray-400">Calculating comparisons...</p>
        </div>
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No trades available for comparison</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Performance Comparisons
          </h1>
          <p className="text-gray-400 mt-2">Compare your performance across time periods, strategies, and benchmarks</p>
        </div>

        {/* Percentile Ranking */}
        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-400" />
            Performance Percentile Ranking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">{percentile.overall.toFixed(0)}</div>
              <div className="text-sm text-gray-400">Overall Percentile</div>
              <div className="text-xs text-gray-500 mt-1">Top {Math.round(100 - percentile.overall)}% of traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{percentile.winRatePercentile.toFixed(0)}</div>
              <div className="text-sm text-gray-400">Win Rate Percentile</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{percentile.profitFactorPercentile.toFixed(0)}</div>
              <div className="text-sm text-gray-400">Profit Factor Percentile</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{percentile.sharpePercentile.toFixed(0)}</div>
              <div className="text-sm text-gray-400">Sharpe Ratio Percentile</div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> Percentile rankings are estimated based on common trading benchmarks. 
              For accurate peer comparison, we would need aggregated data from other traders (anonymized).
            </p>
          </div>
        </div>

        {/* Time Period Comparison */}
        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Time Period Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.values(timePeriods).map((period) => (
              <div key={period.period} className="p-4 rounded-lg bg-[#0F0F0F] border border-white/5">
                <div className="text-sm font-semibold text-white mb-3">{period.period}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trades:</span>
                    <span className="text-white">{period.trades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className={period.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                      {period.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total P&L:</span>
                    <PnLIndicator value={period.totalPnL} size="sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Trade:</span>
                    <PnLIndicator value={period.avgTrade} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.values(timePeriods)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="period" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="totalPnL" name="Total P&L (₹)" fill="#3b82f6" />
                <Bar dataKey="winRate" name="Win Rate %" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategy Comparison */}
        {Array.isArray(strategyMetrics) && strategyMetrics.length >= 2 && strategyComparison && (
          <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Strategy Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Strategy 1</label>
                <select
                  value={selectedStrategy1}
                  onChange={(e) => setSelectedStrategy1(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  {strategyMetrics.map(s => (
                    <option key={s.strategy} value={s.strategy}>{s.strategy}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Strategy 2</label>
                <select
                  value={selectedStrategy2}
                  onChange={(e) => setSelectedStrategy2(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  {strategyMetrics.map(s => (
                    <option key={s.strategy} value={s.strategy}>{s.strategy}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border-2 ${
                strategyComparison.winner === strategyComparison.strategy1.name
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-white/5 bg-[#0F0F0F]'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{strategyComparison.strategy1.name}</h3>
                  {strategyComparison.winner === strategyComparison.strategy1.name && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Winner</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trades:</span>
                    <span className="text-white">{strategyComparison.strategy1.trades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className={strategyComparison.strategy1.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                      {strategyComparison.strategy1.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total P&L:</span>
                    <PnLIndicator value={strategyComparison.strategy1.totalPnL} size="sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Trade:</span>
                    <PnLIndicator value={strategyComparison.strategy1.avgTrade} size="sm" />
                  </div>
                </div>
              </div>
              <div className={`p-6 rounded-xl border-2 ${
                strategyComparison.winner === strategyComparison.strategy2.name
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-white/5 bg-[#0F0F0F]'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{strategyComparison.strategy2.name}</h3>
                  {strategyComparison.winner === strategyComparison.strategy2.name && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Winner</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trades:</span>
                    <span className="text-white">{strategyComparison.strategy2.trades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className={strategyComparison.strategy2.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                      {strategyComparison.strategy2.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total P&L:</span>
                    <PnLIndicator value={strategyComparison.strategy2.totalPnL} size="sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Trade:</span>
                    <PnLIndicator value={strategyComparison.strategy2.avgTrade} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

