'use client'

import { Brain, Award, AlertTriangle, Lightbulb } from 'lucide-react'
import type { Trade } from '@/lib/behavioral/types'
import { calculateTagMetrics, detectPatterns, formatCurrency } from '@/lib/behavioral/utils'

interface InsightsPanelProps {
  trades: Trade[]
}

export default function InsightsPanel({ trades }: InsightsPanelProps) {
  const tagMetrics = calculateTagMetrics(trades)
  const patterns = detectPatterns(trades)
  
  const topTags = tagMetrics.filter((t) => t.winRate >= 60 && t.count >= 3).slice(0, 3)
  const leakTags = tagMetrics.filter((t) => t.totalPnL < 0).slice(0, 3)

  return (
    <div className="bg-[#262628] border border-[#3F3F46] rounded-xl p-6 sticky top-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-[#32B8C6]" />
        <h2 className="text-lg font-semibold text-white">Behavioral Insights</h2>
      </div>

      {/* Top Performing Tags */}
      {topTags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-medium text-gray-300">Top Performing Tags</h3>
          </div>
          <div className="space-y-2">
            {topTags.map((tag) => (
              <div key={tag.tag} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">#{tag.tag}</span>
                <span className="text-green-500 font-medium">
                  {tag.winRate.toFixed(0)}% ({tag.count}T)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leak Detectors */}
      {leakTags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-medium text-gray-300">Leak Detectors</h3>
          </div>
          <div className="space-y-2">
            {leakTags.map((tag) => (
              <div key={tag.tag} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">#{tag.tag}</span>
                <span className="text-red-500 font-medium">
                  {formatCurrency(tag.totalPnL)} ({tag.count}T)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Recognition */}
      {patterns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-medium text-gray-300">Pattern Recognition</h3>
          </div>
          <div className="space-y-3">
            {patterns.map((pattern, idx) => (
              <div
                key={idx}
                className={`
                  p-3 rounded-lg text-xs leading-relaxed
                  ${pattern.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : ''}
                  ${pattern.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : ''}
                  ${pattern.severity === 'info' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : ''}
                `}
              >
                {pattern.insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {trades.length < 30 && (
        <div className="text-xs text-gray-500 mt-6 p-3 bg-[#1F2123] rounded-lg border border-[#3F3F46]">
          Add {30 - trades.length} more trades to unlock advanced pattern detection
        </div>
      )}
    </div>
  )
}
