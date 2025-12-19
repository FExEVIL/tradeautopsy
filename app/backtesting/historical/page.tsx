'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/auth/Input'
import { LegalDisclaimers } from '@/components/backtesting/LegalDisclaimers'
import { clientFetch } from '@/lib/utils/fetch'
import { ArrowLeft, Play, Loader2, AlertCircle } from 'lucide-react'

export default function HistoricalBacktestingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState({
    name: '',
    symbol: 'NIFTY',
    startDate: '',
    endDate: '',
    initialCapital: 100000,
  })

  const handleBacktest = async () => {
    if (!config.name || !config.startDate || !config.endDate) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // Create a basic legs config for the strategy
      const legsConfig = [
        {
          legNumber: 1,
          instrumentType: 'call' as const,
          action: 'buy' as const,
          quantity: 1,
          entryPrice: 0,
          premium: 0,
        },
      ]

      const backtestConfig = {
        name: config.name,
        symbol: config.symbol,
        startDate: config.startDate,
        endDate: config.endDate,
        initialCapital: config.initialCapital,
        strategyName: 'Custom Strategy',
        legsConfig,
        entryRules: {
          daysToExpiry: 7,
          strikeSelection: 'ATM' as const,
        },
        exitRules: {
          targetProfitPct: 50,
          stopLossPct: 100,
          daysToExpiry: 1,
        },
      }

      // ✅ Use clientFetch with proper error handling
      const data = await clientFetch<{ success: boolean; resultId: string }>(
        '/api/backtesting/run',
        {
          method: 'POST',
          body: JSON.stringify(backtestConfig),
        }
      )

      // Verify resultId exists in response
      if (!data.resultId) {
        throw new Error('Backtest completed but no result ID returned')
      }

      // Navigate to results page with the result ID
      router.push(`/backtesting/results/${data.resultId}`)
    } catch (error: any) {
      console.error('Backtest error:', error)
      setError(error.message || 'Failed to run backtest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Historical Backtesting</h1>
            <p className="text-gray-400">
              Test your strategies against historical market data
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card variant="darker" className="border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-400 mb-1">Error</p>
                <p className="text-xs text-gray-400">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Backtest Configuration */}
        <Card variant="darker">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Backtest Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Backtest Name</label>
              <Input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="My Strategy Backtest"
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Symbol</label>
                <Input
                  type="text"
                  value={config.symbol}
                  onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
                  placeholder="NIFTY"
                  className="h-9"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Initial Capital (₹)</label>
                <Input
                  type="number"
                  value={config.initialCapital}
                  onChange={(e) => setConfig({ ...config, initialCapital: parseFloat(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Start Date</label>
                <Input
                  type="date"
                  value={config.startDate}
                  onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                  className="h-9"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">End Date</label>
                <Input
                  type="date"
                  value={config.endDate}
                  onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>

            <button
              onClick={handleBacktest}
              disabled={loading || !config.name || !config.startDate || !config.endDate}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Backtest...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Backtest
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Info Card */}
        <Card variant="darker">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">How It Works</h3>
          <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
            <li>Select a date range and symbol for backtesting</li>
            <li>Configure your strategy parameters and entry/exit rules</li>
            <li>The system will simulate trades based on historical data</li>
            <li>View detailed results including P&L, win rate, and risk metrics</li>
          </ul>
        </Card>

        {/* Legal Disclaimers */}
        <LegalDisclaimers />
      </div>
    </div>
  )
}
