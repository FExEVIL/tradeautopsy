'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { LegalDisclaimers } from '@/components/backtesting/LegalDisclaimers'
import { clientFetch } from '@/lib/utils/fetch'
import { 
  BarChart3, 
  TrendingUp, 
  History, 
  Layers, 
  Calculator,
  Play,
  FileText,
  AlertCircle
} from 'lucide-react'

interface BacktestSummary {
  id: string
  name: string
  strategy_name: string
  symbol: string
  total_trades: number
  win_rate: number
  total_pnl: number
  return_pct: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  created_at: string
}

export default function BacktestingPage() {
  const router = useRouter()
  const [recentBacktests, setRecentBacktests] = useState<BacktestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentBacktests()
  }, [])

  const fetchRecentBacktests = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await clientFetch<{ results: BacktestSummary[] }>(
        '/api/backtesting/results?limit=5'
      )

      setRecentBacktests(data.results || [])
    } catch (error: any) {
      console.error('Error fetching backtests:', error)
      setError(error.message || 'Failed to fetch backtests')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      title: 'Strategy Builder',
      description: 'Build multi-leg options strategies with visual interface',
      icon: Layers,
      href: '/backtesting/strategy-builder',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Historical Backtesting',
      description: 'Test strategies against historical market data',
      icon: History,
      href: '/backtesting/historical',
      color: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    {
      title: 'Option Chain',
      description: 'View real-time and historical option chain data',
      icon: BarChart3,
      href: '/backtesting/option-chain',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Greeks Calculator',
      description: 'Calculate Delta, Gamma, Theta, Vega for your positions',
      icon: Calculator,
      href: '/backtesting/strategy-builder',
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    },
  ]

  const quickActions = [
    {
      title: 'Quick Backtest',
      description: 'Run a quick backtest with default settings',
      icon: Play,
      action: () => router.push('/backtesting/historical'),
    },
    {
      title: 'View Results',
      description: 'Browse your previous backtest results',
      icon: FileText,
      action: () => router.push('/backtesting/results'),
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Backtesting Module</h1>
          <p className="text-gray-400">
            Test and analyze options strategies with historical data and advanced analytics
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <Card
                key={idx}
                variant="darker"
                onClick={action.action}
                className="cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-1">{action.title}</h3>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card
                  key={idx}
                  variant="darker"
                  onClick={() => router.push(feature.href)}
                  className="cursor-pointer hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg border ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Recent Backtests */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Backtests</h2>
          {error && (
            <Card variant="darker" className="border-red-500/20 bg-red-500/5 mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-400 mb-1">Error Loading Data</p>
                  <p className="text-xs text-gray-400">{error}</p>
                  <button
                    onClick={fetchRecentBacktests}
                    className="mt-2 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </Card>
          )}
          {loading ? (
            <Card variant="darker" className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading backtests...</p>
            </Card>
          ) : recentBacktests.length === 0 ? (
            <Card variant="darker" className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No backtests yet</p>
              <button
                onClick={() => router.push('/backtesting/historical')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Run Your First Backtest
              </button>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentBacktests.map((backtest) => (
                <Card
                  key={backtest.id}
                  variant="darker"
                  onClick={() => router.push(`/backtesting/results/${backtest.id}`)}
                  className="cursor-pointer hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {backtest.name || 'Unnamed Backtest'}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {backtest.strategy_name} • {backtest.symbol}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(backtest.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {backtest.status === 'completed' && (
                    <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-xs text-gray-500">Total Trades</p>
                        <p className="text-sm font-semibold">{backtest.total_trades}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Win Rate</p>
                        <p className="text-sm font-semibold">{backtest.win_rate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total P&L</p>
                        <p className={`text-sm font-semibold ${backtest.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {backtest.total_pnl >= 0 ? '+' : ''}₹{backtest.total_pnl.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Return</p>
                        <p className={`text-sm font-semibold ${backtest.return_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {backtest.return_pct >= 0 ? '+' : ''}{backtest.return_pct.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Legal Disclaimers */}
        <LegalDisclaimers />
      </div>
    </div>
  )
}
