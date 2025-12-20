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
  AlertCircle,
  HelpCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  PlayCircle
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

interface GuidanceStep {
  id: string
  title: string
  description: string
  completed: boolean
  action: string
  href: string
}

export default function BacktestingPage() {
  const router = useRouter()
  const [recentBacktests, setRecentBacktests] = useState<BacktestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(true)

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

  const guidanceSteps: GuidanceStep[] = [
    {
      id: '1',
      title: 'Build Your Strategy',
      description: 'Create a multi-leg options strategy with visual payoff diagrams',
      completed: false,
      action: 'Start Building',
      href: '/backtesting/strategy-builder',
    },
    {
      id: '2',
      title: 'Configure Backtest',
      description: 'Set entry/exit rules, date range, and capital allocation',
      completed: false,
      action: 'Configure',
      href: '/backtesting/historical',
    },
    {
      id: '3',
      title: 'Run Backtest',
      description: 'Test your strategy against historical data',
      completed: false,
      action: 'Run Test',
      href: '/backtesting/historical',
    },
    {
      id: '4',
      title: 'Analyze Results',
      description: 'Review performance metrics, equity curve, and trade details',
      completed: false,
      action: 'View Results',
      href: '/backtesting',
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
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold mb-2">Backtesting Module</h1>
              <p className="text-gray-400">
                Test and analyze options strategies with historical data and advanced analytics
              </p>
            </div>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              {showGuide ? 'Hide Guide' : 'Show Guide'}
            </button>
          </div>
        </div>

        {/* Getting Started Guide */}
        {showGuide && (
          <Card variant="darker" className="border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Lightbulb className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Getting Started with Backtesting
                </h2>
                <p className="text-gray-300 mb-4">
                  Follow these steps to backtest your trading strategies and improve your performance.
                  Each step builds on the previous one.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guidanceSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`bg-gray-900 border rounded-lg p-5 transition-all hover:scale-102 ${
                    step.completed ? 'border-green-500/50' : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
                      step.completed 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {step.completed ? '✓' : index + 1}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{step.description}</p>

                      <button
                        onClick={() => router.push(step.href)}
                        className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                          step.completed
                            ? 'text-green-400 hover:text-green-300'
                            : 'text-blue-400 hover:text-blue-300'
                        }`}
                      >
                        {step.action}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">
                New to backtesting?{' '}
                <a href="#tutorial" className="text-blue-400 hover:text-blue-300 underline">
                  Watch our 5-minute tutorial
                </a>
              </span>
            </div>
          </Card>
        )}

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
            <Card variant="darker" className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-6">
                <PlayCircle className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Backtests Yet
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Start by building your first strategy, then run a backtest to see how it would have performed historically.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/backtesting/strategy-builder')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <Layers className="w-5 h-5" />
                  Build Strategy First
                </button>
                <button
                  onClick={() => router.push('/backtesting/historical')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <PlayCircle className="w-5 h-5" />
                  Run Backtest
                </button>
              </div>
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

        {/* Educational Resources */}
        <Card variant="darker" className="border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Learning Resources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="#video-tutorial"
              className="bg-gray-900/50 border border-gray-700 hover:border-purple-500/50 rounded-lg p-4 transition-colors"
            >
              <PlayCircle className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">Video Tutorial</h3>
              <p className="text-sm text-gray-400">
                5-minute guide to backtesting basics
              </p>
            </a>

            <a
              href="#strategy-examples"
              className="bg-gray-900/50 border border-gray-700 hover:border-purple-500/50 rounded-lg p-4 transition-colors"
            >
              <Layers className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">Strategy Examples</h3>
              <p className="text-sm text-gray-400">
                Pre-built strategies to get started
              </p>
            </a>

            <a
              href="#best-practices"
              className="bg-gray-900/50 border border-gray-700 hover:border-purple-500/50 rounded-lg p-4 transition-colors"
            >
              <Lightbulb className="w-8 h-8 text-yellow-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">Best Practices</h3>
              <p className="text-sm text-gray-400">
                Tips for accurate backtesting
              </p>
            </a>
          </div>
        </Card>

        {/* Legal Disclaimers */}
        <LegalDisclaimers />
      </div>
    </div>
  )
}
