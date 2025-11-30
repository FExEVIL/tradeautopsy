'use client'

import Link from 'next/link'
import { AlertCircle, BookOpen } from 'lucide-react'

interface QuickInsightsProps {
  journaledCount: number
  totalCount: number
}

export default function QuickInsights({ journaledCount, totalCount }: QuickInsightsProps) {
  const notJournaledCount = totalCount - journaledCount
  const journalPercentage = totalCount > 0 ? ((journaledCount / totalCount) * 100).toFixed(0) : 0

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-emerald-500" />
        Journal Progress
      </h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-zinc-400">Journaled Trades</p>
            <p className="text-sm font-medium text-white">{journalPercentage}%</p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${journalPercentage}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {journaledCount} of {totalCount} trades
          </p>
        </div>

        {notJournaledCount > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-500 mb-1">
                  {notJournaledCount} trades need review
                </p>
                <p className="text-xs text-zinc-400 mb-3">
                  Add notes and tags to improve your behavioral insights
                </p>
                <Link
                  href="/dashboard/trades"
                  className="text-xs text-emerald-500 hover:text-emerald-400 font-medium"
                >
                  Add Journal Entries →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
