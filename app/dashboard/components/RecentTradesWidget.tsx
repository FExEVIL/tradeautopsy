'use client'

import Link from 'next/link'
import { Trade } from '@/types/trade'
import { FileText, ArrowRight } from 'lucide-react'

interface RecentTradesWidgetProps {
  trades: Trade[]
}

export default function RecentTradesWidget({ trades }: RecentTradesWidgetProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
        <Link
          href="/dashboard/trades"
          className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {trades.map((trade) => {
          const isProfit = (trade.pnl || 0) > 0
          const hasJournal = trade.journal_note || trade.journal_tags?.length
          return (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {hasJournal && <FileText className="w-4 h-4 text-emerald-500" />}
                <div>
                  <p className="font-medium text-white">{trade.tradingsymbol}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(trade.trade_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <p className={`font-semibold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                {isProfit ? '+' : ''}₹{(trade.pnl || 0).toLocaleString('en-IN')}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
