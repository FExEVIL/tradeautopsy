'use client'

import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { LegalDisclaimers } from '@/components/backtesting/LegalDisclaimers'
import { ArrowLeft, TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react'

export default function BacktestResultsPage() {
  const router = useRouter()
  const params = useParams()
  const resultId = params.id as string

  // TODO: Fetch actual results from API
  const mockResults = {
    totalTrades: 45,
    winningTrades: 28,
    losingTrades: 17,
    winRate: 62.22,
    totalPnL: 125000,
    avgWin: 8500,
    avgLoss: -3200,
    maxDrawdown: -25000,
    profitFactor: 2.65,
    sharpeRatio: 1.85,
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Backtest Results</h1>
            <p className="text-gray-400">
              Detailed analysis of your backtest performance
            </p>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="darker">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-gray-400">Total Trades</p>
            </div>
            <p className="text-2xl font-bold text-white">{mockResults.totalTrades}</p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-xs text-gray-400">Win Rate</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{mockResults.winRate.toFixed(1)}%</p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-yellow-400" />
              <p className="text-xs text-gray-400">Total P&L</p>
            </div>
            <p className={`text-2xl font-bold ${mockResults.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{mockResults.totalPnL.toLocaleString()}
            </p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <p className="text-xs text-gray-400">Max Drawdown</p>
            </div>
            <p className="text-2xl font-bold text-red-400">₹{Math.abs(mockResults.maxDrawdown).toLocaleString()}</p>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="darker">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Average Win</span>
                <span className="text-sm font-semibold text-green-400">₹{mockResults.avgWin.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Average Loss</span>
                <span className="text-sm font-semibold text-red-400">₹{Math.abs(mockResults.avgLoss).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Profit Factor</span>
                <span className="text-sm font-semibold text-white">{mockResults.profitFactor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Sharpe Ratio</span>
                <span className="text-sm font-semibold text-white">{mockResults.sharpeRatio.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card variant="darker">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Trade Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Winning Trades</span>
                <span className="text-sm font-semibold text-green-400">{mockResults.winningTrades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Losing Trades</span>
                <span className="text-sm font-semibold text-red-400">{mockResults.losingTrades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Win Rate</span>
                <span className="text-sm font-semibold text-white">{mockResults.winRate.toFixed(1)}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Equity Curve Placeholder */}
        <Card variant="darker">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Equity Curve</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p className="text-sm">Equity curve chart will be displayed here</p>
          </div>
        </Card>

        {/* Legal Disclaimers */}
        <LegalDisclaimers />
      </div>
    </div>
  )
}
