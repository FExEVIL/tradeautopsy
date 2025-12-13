'use client'

import { useMemo } from 'react'
import { Shield, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react'
import { Trade } from '@/types/trade'
import {
  calculateMaxDrawdown,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateKellyCriterion,
  calculateRecoveryFactor,
  calculateMaxConsecutiveLosses,
  calculateMaxConsecutiveWins,
  calculateDailyReturns,
  calculateVaR
} from '@/lib/risk-calculations'
import { RiskCalculators } from './components/RiskCalculators'
import { calculateAvgProfit, calculateAvgLoss } from '@/lib/calculations'
import { formatINR } from '@/lib/formatters'
import { PnLIndicator } from '@/components/PnLIndicator'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface RiskClientProps {
  trades: Trade[]
}

export function RiskClient({ trades }: RiskClientProps) {
  const riskMetrics = useMemo(() => {
    if (trades.length === 0) {
      return {
        maxDrawdown: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        kellyCriterion: 0,
        recoveryFactor: 0,
        maxConsecutiveLosses: 0,
        maxConsecutiveWins: 0,
        var95: 0,
        avgWin: 0,
        avgLoss: 0
      }
    }

    const dailyReturns = calculateDailyReturns(trades as any)
    const avgWin = calculateAvgProfit(trades as any)
    const avgLoss = calculateAvgLoss(trades as any)
    const winRate = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0).length / trades.length * 100

    return {
      maxDrawdown: calculateMaxDrawdown(trades as any),
      sharpeRatio: calculateSharpeRatio(dailyReturns),
      sortinoRatio: calculateSortinoRatio(dailyReturns),
      kellyCriterion: calculateKellyCriterion(winRate, avgWin, Math.abs(avgLoss)),
      recoveryFactor: calculateRecoveryFactor(trades as any),
      maxConsecutiveLosses: calculateMaxConsecutiveLosses(trades as any),
      maxConsecutiveWins: calculateMaxConsecutiveWins(trades as any),
      var95: calculateVaR(dailyReturns, 0.95),
      avgWin,
      avgLoss: Math.abs(avgLoss)
    }
  }, [trades])

  const riskScore = useMemo(() => {
    // Calculate overall risk score (0-100, lower is better)
    let score = 50 // Base score

    // Adjust based on metrics
    if (riskMetrics.maxDrawdown > 20) score += 20
    if (riskMetrics.maxDrawdown < 10) score -= 10

    if (riskMetrics.sharpeRatio < 0) score += 15
    if (riskMetrics.sharpeRatio > 1) score -= 10

    if (riskMetrics.maxConsecutiveLosses > 5) score += 15
    if (riskMetrics.maxConsecutiveLosses < 3) score -= 5

    if (riskMetrics.recoveryFactor < 1) score += 10
    if (riskMetrics.recoveryFactor > 2) score -= 10

    return Math.max(0, Math.min(100, score))
  }, [riskMetrics])

  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: 'Low Risk', color: 'text-green-400', bg: 'bg-green-500/10' }
    if (score < 60) return { label: 'Moderate Risk', color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
    return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/10' }
  }

  const riskLevel = getRiskLevel(riskScore)

  if (trades.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No trades available for risk analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            Risk Management Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Comprehensive risk metrics and analysis</p>
        </div>

               {/* Risk Score Overview */}
               <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Overall Risk Score</div>
              <div className={`text-4xl font-bold ${riskLevel.color}`}>{riskScore}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${riskLevel.bg} ${riskLevel.color}`}>
                {riskLevel.label}
              </div>
            </div>
            <Shield className={`w-16 h-16 ${riskLevel.color} opacity-50`} />
          </div>
        </div>

               {/* Key Risk Metrics */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="p-5 rounded-xl bg-[#0F0F0F] border border-white/5">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Max Drawdown</div>
            <div className="text-2xl font-bold text-red-400">{riskMetrics.maxDrawdown.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-1">Peak-to-trough decline</div>
          </div>

          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sharpe Ratio</div>
            <div className={`text-2xl font-bold ${riskMetrics.sharpeRatio > 1 ? 'text-green-400' : riskMetrics.sharpeRatio > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              {riskMetrics.sharpeRatio.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Risk-adjusted returns</div>
          </div>

          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sortino Ratio</div>
            <div className={`text-2xl font-bold ${riskMetrics.sortinoRatio > 1 ? 'text-green-400' : 'text-yellow-400'}`}>
              {riskMetrics.sortinoRatio > 10 ? '10+' : riskMetrics.sortinoRatio.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Downside risk adjusted</div>
          </div>

          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Recovery Factor</div>
            <div className={`text-2xl font-bold ${riskMetrics.recoveryFactor > 2 ? 'text-green-400' : riskMetrics.recoveryFactor > 1 ? 'text-yellow-400' : 'text-red-400'}`}>
              {riskMetrics.recoveryFactor.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Net Profit / Max DD</div>
          </div>
        </div>

               {/* Position Sizing & Kelly */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Position Sizing Analysis</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Kelly Criterion</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {(riskMetrics.kellyCriterion * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(100, riskMetrics.kellyCriterion * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optimal position size: {riskMetrics.kellyCriterion > 0.25 ? 'Reduce risk' : riskMetrics.kellyCriterion > 0.1 ? 'Moderate' : 'Conservative'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Average Win</span>
                  <PnLIndicator value={riskMetrics.avgWin} size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Average Loss</span>
                  <PnLIndicator value={-riskMetrics.avgLoss} size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Risk-Reward Ratio</span>
                  <span className="text-sm font-mono font-bold text-white">
                    1 : {riskMetrics.avgLoss > 0 ? (riskMetrics.avgWin / riskMetrics.avgLoss).toFixed(2) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Streak Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Max Consecutive Losses</div>
                  <div className="text-2xl font-bold text-red-400">{riskMetrics.maxConsecutiveLosses}</div>
                </div>
                <TrendingDown className="w-8 h-8 text-red-400 opacity-50" />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Max Consecutive Wins</div>
                  <div className="text-2xl font-bold text-green-400">{riskMetrics.maxConsecutiveWins}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="text-xs text-gray-500 mb-2">Value at Risk (95% confidence)</div>
                <div className="text-lg font-mono font-bold text-yellow-400">
                  {formatINR(riskMetrics.var95)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum expected daily loss</p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Calculators */}
        <RiskCalculators
          winRate={trades.length > 0 ? (trades.filter(t => parseFloat(String(t.pnl || '0')) > 0).length / trades.length) * 100 : 0}
          avgWin={riskMetrics.avgWin}
          avgLoss={riskMetrics.avgLoss}
          trades={trades}
        />

        {/* Risk Recommendations */}
        <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Risk Recommendations
          </h3>
          <div className="space-y-3">
            {riskMetrics.maxDrawdown > 20 && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 font-medium mb-1">High Drawdown Detected</p>
                <p className="text-xs text-gray-400">
                  Your maximum drawdown is {riskMetrics.maxDrawdown.toFixed(1)}%. Consider reducing position sizes or tightening stop losses.
                </p>
              </div>
            )}

            {riskMetrics.sharpeRatio < 0 && (
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400 font-medium mb-1">Negative Sharpe Ratio</p>
                <p className="text-xs text-gray-400">
                  Your risk-adjusted returns are negative. Focus on improving win rate or reducing volatility.
                </p>
              </div>
            )}

            {riskMetrics.kellyCriterion > 0.25 && (
              <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <p className="text-sm text-orange-400 font-medium mb-1">Position Size Too Large</p>
                <p className="text-xs text-gray-400">
                  Kelly Criterion suggests reducing position size to {(riskMetrics.kellyCriterion * 100).toFixed(1)}% of capital.
                </p>
              </div>
            )}

            {riskMetrics.maxConsecutiveLosses > 5 && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 font-medium mb-1">Long Losing Streak</p>
                <p className="text-xs text-gray-400">
                  You've had {riskMetrics.maxConsecutiveLosses} consecutive losses. Consider taking a break and reviewing your strategy.
                </p>
              </div>
            )}

            {riskMetrics.maxDrawdown < 10 && riskMetrics.sharpeRatio > 1 && riskMetrics.recoveryFactor > 2 && (
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400 font-medium mb-1">Excellent Risk Management</p>
                <p className="text-xs text-gray-400">
                  Your risk metrics are strong. Keep maintaining discipline and following your plan.
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

