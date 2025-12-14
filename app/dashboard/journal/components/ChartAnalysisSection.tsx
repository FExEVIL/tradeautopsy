'use client'

import { useState } from 'react'
import { Upload, Image as ImageIcon, FileText, TrendingUp, BarChart3, AlertTriangle, Calendar } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import ChartsClient to avoid SSR issues
const ChartsClient = dynamic(() => import('@/app/dashboard/charts/ChartsClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <div className="text-gray-400 animate-pulse">Loading charts...</div>
    </div>
  )
})

interface ChartAnalysisSectionProps {
  trades: any[]
}

export function ChartAnalysisSection({ trades }: ChartAnalysisSectionProps) {
  const [selectedTrade, setSelectedTrade] = useState<string>('')
  const [chartImage, setChartImage] = useState<File | null>(null)

  // Calculate metrics for charts (same as ChartsPage)
  const safeParseFloat = (value: any): number => {
    if (typeof value === 'number') return value
    if (!value) return 0
    if (typeof value === 'string') {
      const cleaned = value.replace(/[₹,]/g, '')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const processedTrades = (trades || []).map(t => ({
    ...t,
    pnl: safeParseFloat(t.pnl),
    dateObj: t.trade_date ? new Date(t.trade_date) : new Date()
  }))

  // Calculate metrics
  let cumulativePnL = 0
  let maxEquity = -Infinity
  const equityCurve: any[] = []
  const dailyPnLMap: { [date: string]: number } = {}

  processedTrades.forEach(t => {
    const pnl = t.pnl
    cumulativePnL += pnl
    
    if (cumulativePnL > maxEquity) maxEquity = cumulativePnL

    const dateKey = t.dateObj.toISOString().split('T')[0]
    dailyPnLMap[dateKey] = (dailyPnLMap[dateKey] || 0) + pnl

    equityCurve.push({
      date: t.dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      equity: cumulativePnL,
      rawDate: t.dateObj.getTime()
    })
  })

  const metrics = {
    totalPnL: cumulativePnL,
    peakPnL: maxEquity,
    winRate: processedTrades.length > 0 
      ? (processedTrades.filter(t => t.pnl > 0).length / processedTrades.length) * 100 
      : 0,
    equityCurve,
    dailyPnL: dailyPnLMap
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setChartImage(e.target.files[0])
    }
  }

  return (
    <div className="space-y-6">
      {/* Chart Visualizations */}
      <div className="space-y-6">
        <ChartsClient trades={processedTrades as any[]} metrics={metrics} />
      </div>

      {/* Upload Chart for Analysis */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-400" />
          Upload Chart Screenshot
        </h3>

        <div className="space-y-4">
          {/* Trade Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Select Trade (Optional)
            </label>
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="">Select a trade...</option>
              {trades.slice(0, 50).map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.tradingsymbol || trade.symbol} - {trade.trade_date} - {trade.transaction_type}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Chart Screenshot
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="chart-upload"
              />
              <label htmlFor="chart-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 10MB
                </p>
              </label>
            </div>

            {chartImage && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">{chartImage.name}</span>
              </div>
            )}
          </div>

          {/* Analysis Notes */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Analysis Notes
            </label>
            <textarea
              placeholder="What patterns do you see? Entry/exit points? Key levels?"
              className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg resize-none focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
            />
          </div>

          <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium text-white">
            <FileText className="w-4 h-4 inline mr-2" />
            Save Chart Analysis
          </button>
        </div>
      </div>

      {/* Previous Chart Analyses */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Chart Analyses</h3>
        <p className="text-sm text-gray-400">No chart analyses yet. Upload your first chart screenshot above.</p>
      </div>
    </div>
  )
}
