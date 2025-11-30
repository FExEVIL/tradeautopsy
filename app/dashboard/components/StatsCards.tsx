'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardsProps {
  thisWeek: { pnl: number; trades: number; winRate: number }
  thisMonth: { pnl: number; trades: number; winRate: number }
  allTime: { pnl: number; trades: number; winRate: number }
}

export default function StatsCards({ thisWeek, thisMonth, allTime }: StatsCardsProps) {
  const cards = [
    { title: 'This Week', subtitle: 'Last 7 days', data: thisWeek },
    { title: 'This Month', subtitle: new Date().toLocaleDateString('en-IN', { month: 'long' }), data: thisMonth },
    { title: 'All Time', subtitle: 'Total performance', data: allTime },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const isPositive = card.data.pnl >= 0
        return (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-zinc-400">{card.title}</p>
                <p className="text-xs text-zinc-500">{card.subtitle}</p>
              </div>
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className={`text-3xl font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  ₹{Math.abs(card.data.pnl).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {card.data.trades} trades
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <p className="text-sm text-zinc-400">
                  Win Rate: <span className="text-white font-medium">{card.data.winRate.toFixed(1)}%</span>
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
