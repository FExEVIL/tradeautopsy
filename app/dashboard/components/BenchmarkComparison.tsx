'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { PnLIndicator } from '@/components/PnLIndicator'
import { formatINR } from '@/lib/formatters'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'

interface BenchmarkDataPoint {
  date: string
  close: number
  change: number
  changePercent: number
}

interface BenchmarkResponse {
  index: 'NIFTY_50' | 'SENSEX'
  data: BenchmarkDataPoint[]
  startDate: string
  endDate: string
  warning?: string
}

interface PortfolioDataPoint {
  date: string
  value: number
  dailyPnL: number
}

interface BenchmarkComparisonProps {
  portfolioData: PortfolioDataPoint[]
  startDate: string
  endDate: string
  initialPortfolioValue?: number
}

export function BenchmarkComparison({
  portfolioData,
  startDate,
  endDate,
  initialPortfolioValue = 0,
}: BenchmarkComparisonProps) {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<'NIFTY_50' | 'SENSEX'>('NIFTY_50')

  useEffect(() => {
    fetchBenchmarkData()
  }, [selectedIndex, startDate, endDate])

  const fetchBenchmarkData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      let response: Response
      try {
        response = await fetch(
          `/api/benchmark?index=${selectedIndex}&start=${startDate}&end=${endDate}`,
          {
            signal: controller.signal,
          }
        )
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        // Handle network errors
        if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
          throw new Error('Request timed out. Please check your connection and try again.')
        }
        if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          throw new Error('Network error. Please check your internet connection or try again later.')
        }
        throw fetchError
      }
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch benchmark data'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response isn't JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      const data: BenchmarkResponse = await response.json()
      setBenchmarkData(data)
    } catch (err) {
      console.error('Benchmark fetch error:', err)
      
      // Handle different error types
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('timeout') || err.message.includes('aborted')) {
          setError('Request timed out. Please check your connection and try again.')
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('network') || err.name === 'TypeError') {
          setError('Network error. Please check your internet connection or try again later.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to load benchmark data. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Normalize data for comparison
  const comparisonData = benchmarkData ? normalizeDataForComparison(
    portfolioData,
    benchmarkData.data,
    initialPortfolioValue
  ) : []

  // Calculate returns
  const portfolioReturn = portfolioData.length > 0
    ? ((portfolioData[portfolioData.length - 1].value - initialPortfolioValue) / Math.abs(initialPortfolioValue || 1)) * 100
    : 0

  const benchmarkReturn = benchmarkData && benchmarkData.data.length > 0
    ? ((benchmarkData.data[benchmarkData.data.length - 1].close - benchmarkData.data[0].close) / benchmarkData.data[0].close) * 100
    : 0

  const alpha = portfolioReturn - benchmarkReturn

  if (loading) {
    return (
      <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="ml-3 text-gray-400">Loading benchmark data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">Failed to load benchmark data</p>
          <p className="text-sm text-gray-500">{error}</p>
          {error.includes('Zerodha not connected') && (
            <a
              href="/api/zerodha/auth"
              className="mt-4 inline-block text-emerald-400 hover:text-emerald-300 text-sm"
            >
              Connect Zerodha Account →
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Portfolio vs Benchmark</h2>
          <p className="text-sm text-gray-400 mt-1">
            Performance comparison with {selectedIndex === 'NIFTY_50' ? 'Nifty 50' : 'Sensex'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedIndex('NIFTY_50')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedIndex === 'NIFTY_50'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Nifty 50
          </button>
          <button
            onClick={() => setSelectedIndex('SENSEX')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedIndex === 'SENSEX'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Sensex
          </button>
        </div>
      </div>

      {benchmarkData?.warning && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-400">{benchmarkData.warning}</p>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0A0A0A] rounded-lg p-4 border border-white/5">
          <p className="text-xs text-gray-500 uppercase mb-1">Portfolio Return</p>
          <PnLIndicator value={portfolioReturn} variant="text" size="lg" />
        </div>
        <div className="bg-[#0A0A0A] rounded-lg p-4 border border-white/5">
          <p className="text-xs text-gray-500 uppercase mb-1">Benchmark Return</p>
          <div className={`text-2xl font-mono font-bold ${
            benchmarkReturn >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {benchmarkReturn >= 0 ? '+' : ''}{benchmarkReturn.toFixed(2)}%
          </div>
        </div>
        <div className="bg-[#0A0A0A] rounded-lg p-4 border border-white/5">
          <p className="text-xs text-gray-500 uppercase mb-1">Alpha (Excess Return)</p>
          <div className="flex items-center gap-2">
            {alpha >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <PnLIndicator value={alpha} variant="text" size="lg" />
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#666"
              tickLine={false}
              axisLine={false}
              tickFormatter={d => format(new Date(d), 'dd MMM')}
            />
            <YAxis
              stroke="#666"
              tickLine={false}
              axisLine={false}
              tickFormatter={value => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F0F0F',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
              }}
              labelFormatter={d => format(new Date(d), 'dd MMM yyyy')}
              formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="portfolio"
              name="Portfolio"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="benchmark"
              name={selectedIndex === 'NIFTY_50' ? 'Nifty 50' : 'Sensex'}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/**
 * Normalize portfolio and benchmark data for comparison
 * Converts both to percentage returns from start
 */
function normalizeDataForComparison(
  portfolioData: PortfolioDataPoint[],
  benchmarkData: BenchmarkDataPoint[],
  initialPortfolioValue: number
): Array<{ date: string; portfolio: number; benchmark: number }> {
  if (portfolioData.length === 0 || benchmarkData.length === 0) {
    return []
  }

  const portfolioMap = new Map(
    portfolioData.map(p => [p.date, p.value])
  )

  const benchmarkStart = benchmarkData[0].close
  const portfolioStart = initialPortfolioValue || portfolioData[0].value

  return benchmarkData
    .filter(b => portfolioMap.has(b.date))
    .map(b => {
      const portfolioValue = portfolioMap.get(b.date) || portfolioStart
      const portfolioReturn = ((portfolioValue - portfolioStart) / Math.abs(portfolioStart || 1)) / 100
      const benchmarkReturn = ((b.close - benchmarkStart) / benchmarkStart) / 100

      return {
        date: b.date,
        portfolio: portfolioReturn,
        benchmark: benchmarkReturn,
      }
    })
}

