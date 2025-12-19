'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/auth/Input'
import { LegalDisclaimers } from '@/components/backtesting/LegalDisclaimers'
import { ArrowLeft, Play, Loader2 } from 'lucide-react'

export default function HistoricalBacktestingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    name: '',
    symbol: 'NIFTY',
    startDate: '',
    endDate: '',
    initialCapital: 100000,
  })

  const handleBacktest = async () => {
    setLoading(true)
    // TODO: Implement backtest API call
    setTimeout(() => {
      setLoading(false)
      // Navigate to results page
      router.push('/backtesting/results')
    }, 2000)
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
