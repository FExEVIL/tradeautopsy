'use client'

import { BarChart3, Target, BadgeIndianRupee, Scale } from 'lucide-react'
import type { Trade } from '@/lib/behavioral/types'
import { formatCurrency } from '@/lib/behavioral/utils'

interface StatsGridProps {
  trades: Trade[]
}

export default function StatsGrid({ trades }: StatsGridProps) {
  const totalTrades = trades.length
  const winningTrades = trades.filter((t) => t.pnl > 0).length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
  
  const avgWin = winningTrades > 0 
    ? trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades 
    : 0
  const losingTrades = trades.filter((t) => t.pnl < 0)
  const avgLoss = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
    : 0
  const riskReward = avgLoss > 0 ? avgWin / avgLoss : 0

  const stats = [
    { icon: BarChart3, label: 'Total Trades', value: totalTrades, color: 'text-[#32B8C6]' },
    { icon: Target, label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: 'text-green-500' },
    { icon: BadgeIndianRupee, label: 'Net P&L', value: formatCurrency(totalPnL), color: totalPnL >= 0 ? 'text-green-500' : 'text-red-500' },
    { icon: Scale, label: 'R:R Ratio', value: `${riskReward.toFixed(1)}:1`, color: 'text-purple-500' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-[#262628] border border-[#3F3F46] rounded-xl p-6 hover:border-[#32B8C6]/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-sm text-gray-400">{label}</span>
          </div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  )
}
