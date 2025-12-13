'use client'

import { useMemo, useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Clock, Target, BarChart3, Zap, Loader2 } from 'lucide-react'
import { Trade } from '@/types/trade'
import {
  analyzeByStrategy,
  analyzeByTime,
  analyzeBySymbol,
  analyzeBySetup,
  getBestWorstStrategies
} from '@/lib/strategy-analysis'
import { formatINR } from '@/lib/formatters'
import { PnLIndicator } from '@/components/PnLIndicator'
import { ErrorState } from '../components/ErrorState'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts'

interface StrategyAnalysisClientProps {
  trades: Trade[]
}

const STRATEGY_COLORS: Record<string, string> = {
  'Intraday': '#3b82f6',
  'Delivery': '#10b981',
  'Swing': '#8b5cf6',
  'Options': '#f59e0b',
  'Unknown': '#6b7280'
}

export default function StrategyAnalysisClient({ trades }: StrategyAnalysisClientProps) {
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

  const strategyMetrics = useMemo(() => analyzeByStrategy(trades), [trades])
  const timePerformance = useMemo(() => analyzeByTime(trades), [trades])
  const symbolPerformance = useMemo(() => analyzeBySymbol(trades), [trades])
  const setupPerformance = useMemo(() => analyzeBySetup(trades), [trades])
  const { best, worst } = useMemo(() => getBestWorstStrategies(strategyMetrics), [strategyMetrics])

  if (isCalculating) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-400 animate-spin" />
          <p className="text-gray-400">Analyzing strategies...</p>
        </div>
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No trades available for strategy analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Advanced Strategy Analysis
          </h1>
          <p className="text-gray-400 mt-2">Compare strategies, analyze time-based performance, and identify your best setups</p>
        </div>

        {/* Strategy Comparison */}
        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Strategy Comparison
          </h2>

          {strategyMetrics.length > 0 ? (
            <div className="space-y-6">
              {/* Strategy Metrics Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Strategy</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Trades</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Win Rate</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Total P&L</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Avg Win</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Avg Loss</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Profit Factor</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Expectancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategyMetrics.map((strategy) => (
                      <tr key={strategy.strategy} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: STRATEGY_COLORS[strategy.strategy] || '#6b7280' }}
                            />
                            <span className="font-medium text-white">{strategy.strategy}</span>
                            {best?.strategy === strategy.strategy && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Best</span>
                            )}
                            {worst?.strategy === strategy.strategy && (
                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Worst</span>
                            )}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-300">{strategy.totalTrades}</td>
                        <td className="text-right py-3 px-4">
                          <span className={strategy.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                            {strategy.winRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <PnLIndicator value={strategy.totalPnL} size="sm" />
                        </td>
                        <td className="text-right py-3 px-4 text-green-400">{formatINR(strategy.avgWin)}</td>
                        <td className="text-right py-3 px-4 text-red-400">{formatINR(-strategy.avgLoss)}</td>
                        <td className="text-right py-3 px-4">
                          <span className={strategy.profitFactor >= 1 ? 'text-green-400' : 'text-red-400'}>
                            {strategy.profitFactor.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={strategy.expectancy >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {formatINR(strategy.expectancy)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Strategy Comparison Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="strategy" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="totalPnL" name="Total P&L" fill="#3b82f6" />
                    <Bar dataKey="winRate" name="Win Rate %" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No strategy data available</p>
          )}
        </div>

        {/* Time-Based Performance */}
        {timePerformance.length > 0 && (
          <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Time-Based Performance
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#666" label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="winRate" name="Win Rate %" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="avgPnL" name="Avg P&L (₹)" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Symbol Performance */}
        {symbolPerformance.length > 0 && (
          <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Top Performing Symbols
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {symbolPerformance.slice(0, 12).map((symbol) => (
                <div key={symbol.symbol} className="p-4 rounded-lg bg-[#0A0A0A] border border-white/5">
                  <div className="font-semibold text-white mb-2">{symbol.symbol}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trades:</span>
                      <span className="text-white">{symbol.trades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate:</span>
                      <span className={symbol.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                        {symbol.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total P&L:</span>
                      <PnLIndicator value={symbol.totalPnL} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Performance */}
        {setupPerformance.length > 0 && (
          <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Setup Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {setupPerformance.map((setup) => (
                <div key={setup.setup} className="p-4 rounded-lg bg-[#0A0A0A] border border-white/5">
                  <div className="font-semibold text-white mb-2">{setup.setup}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trades:</span>
                      <span className="text-white">{setup.trades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate:</span>
                      <span className={setup.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                        {setup.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total P&L:</span>
                      <PnLIndicator value={setup.totalPnL} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}

