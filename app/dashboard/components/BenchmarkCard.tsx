'use client'

import { TrendingUp, Link as LinkIcon } from 'lucide-react'
import { PnLIndicator } from '@/components/PnLIndicator'
import { formatINR } from '@/lib/formatters'

interface BenchmarkCardProps {
  portfolioReturn?: number
  niftyReturn?: number
  sensexReturn?: number
  isConnected?: boolean
}

export function BenchmarkCard({
  portfolioReturn,
  niftyReturn,
  sensexReturn,
  isConnected = false,
}: BenchmarkCardProps) {
  if (!isConnected) {
    return (
      <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Benchmark Comparison
            </h3>
            <p className="text-sm text-gray-400">
              Your returns vs Nifty 50 / Sensex
            </p>
          </div>
          <TrendingUp className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="mt-6 p-4 bg-[#0F0F0F] rounded-lg border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <LinkIcon className="w-5 h-5 text-gray-400" />
            <p className="text-sm text-gray-300">
              Connect Zerodha to compare with Sensex and Nifty 50
            </p>
          </div>
          <a
            href="/api/zerodha/auth"
            className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Connect Zerodha →
          </a>
        </div>

        {/* Placeholder chart area */}
        <div className="mt-4 h-32 bg-[#0F0F0F] rounded-lg border border-white/5 flex items-center justify-center">
          <p className="text-xs text-gray-500">Comparison chart will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Benchmark Comparison
          </h3>
          <p className="text-sm text-gray-400">
            Your returns vs Nifty 50 / Sensex
          </p>
        </div>
        <TrendingUp className="w-6 h-6 text-emerald-400" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Portfolio</p>
          {portfolioReturn !== undefined ? (
            <PnLIndicator value={portfolioReturn} size="sm" />
          ) : (
            <p className="text-sm text-gray-500">—</p>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Nifty 50</p>
          {niftyReturn !== undefined ? (
            <PnLIndicator value={niftyReturn} size="sm" />
          ) : (
            <p className="text-sm text-gray-500">—</p>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Sensex</p>
          {sensexReturn !== undefined ? (
            <PnLIndicator value={sensexReturn} size="sm" />
          ) : (
            <p className="text-sm text-gray-500">—</p>
          )}
        </div>
      </div>

      {/* Placeholder chart area */}
      <div className="h-32 bg-[#0F0F0F] rounded-lg border border-white/5 flex items-center justify-center">
        <p className="text-xs text-gray-500">Comparison chart will appear here</p>
      </div>
    </div>
  )
}

