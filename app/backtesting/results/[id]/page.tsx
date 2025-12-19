'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { LegalDisclaimers } from '@/components/backtesting/LegalDisclaimers'
import { ArrowLeft, TrendingUp, TrendingDown, Target, BarChart3, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function BacktestResultsPage() {
  const router = useRouter()
  const params = useParams()
  const resultId = params.id as string
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetchResult()
  }, [resultId])

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/backtesting/results/${resultId}`)
      if (!response.ok) throw new Error('Failed to fetch result')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error fetching result:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading backtest results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card variant="darker" className="text-center py-12">
            <p className="text-red-400">Backtest not found</p>
          </Card>
        </div>
      </div>
    )
  }

  const displayResults = {
    totalTrades: result.total_trades || 0,
    winningTrades: result.winning_trades || 0,
    losingTrades: result.losing_trades || 0,
    winRate: result.win_rate || 0,
    totalPnL: result.total_pnl || 0,
    avgWin: result.avg_win || 0,
    avgLoss: result.avg_loss || 0,
    maxDrawdown: result.max_drawdown || 0,
    maxDrawdownPct: result.max_drawdown_pct || 0,
    profitFactor: result.profit_factor || 0,
    sharpeRatio: result.sharpe_ratio || 0,
    equityCurve: result.equity_curve || [],
    tradeDetails: result.trade_details || [],
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
            <p className="text-2xl font-bold text-white">{displayResults.totalTrades}</p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-xs text-gray-400">Win Rate</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{displayResults.winRate.toFixed(1)}%</p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-yellow-400" />
              <p className="text-xs text-gray-400">Total P&L</p>
            </div>
            <p className={`text-2xl font-bold ${displayResults.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{displayResults.totalPnL.toLocaleString()}
            </p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <p className="text-xs text-gray-400">Max Drawdown</p>
            </div>
            <p className="text-2xl font-bold text-red-400">₹{Math.abs(displayResults.maxDrawdown).toLocaleString()}</p>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="darker">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Average Win</span>
                <span className="text-sm font-semibold text-green-400">₹{displayResults.avgWin.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Average Loss</span>
                <span className="text-sm font-semibold text-red-400">₹{Math.abs(displayResults.avgLoss).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Profit Factor</span>
                <span className="text-sm font-semibold text-white">{displayResults.profitFactor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Sharpe Ratio</span>
                <span className="text-sm font-semibold text-white">{displayResults.sharpeRatio.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card variant="darker">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Trade Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Winning Trades</span>
                <span className="text-sm font-semibold text-green-400">{displayResults.winningTrades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Losing Trades</span>
                <span className="text-sm font-semibold text-red-400">{displayResults.losingTrades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Win Rate</span>
                <span className="text-sm font-semibold text-white">{displayResults.winRate.toFixed(1)}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Equity Curve */}
        {displayResults.equityCurve.length > 0 && (
          <Card variant="darker">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Equity Curve</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayResults.equityCurve.map((point: any) => ({
                  date: typeof point.date === 'string' ? point.date : new Date(point.date).toLocaleDateString(),
                  equity: point.equity,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
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
                            <p className="text-xs text-gray-400">{payload[0].payload.date}</p>
                            <p className={`text-sm font-semibold ${displayResults.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              Equity: ₹{payload[0].value?.toLocaleString()}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                    cursor={{ stroke: '#ffffff20' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="equity" 
                    stroke={displayResults.totalPnL >= 0 ? "#10b981" : "#ef4444"} 
                    strokeWidth={2} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Legal Disclaimers */}
        <LegalDisclaimers />
      </div>
    </div>
  )
}
