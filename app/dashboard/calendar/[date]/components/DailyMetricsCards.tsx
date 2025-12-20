'use client'

import { TrendingDown, TrendingUp, Target, Activity, BarChart3, AlertCircle } from 'lucide-react'
import { formatINR } from '@/lib/formatters'

interface Metrics {
  totalPnL: number
  winRate: string
  avgProfit: number
  avgLoss: number
  profitFactor: string
  riskRewardRatio: string
  maxDrawdown: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
}

export function DailyMetricsCards({ metrics }: { metrics: Metrics }) {
  const formatValue = (value: any, format: string) => {
    if (format === 'currency') {
      const num = typeof value === 'number' ? value : 0
      return formatINR(num)
    }
    return value
  }

  const cards = [
    {
      label: 'TOTAL P&L',
      value: metrics.totalPnL,
      format: 'currency',
      subtitle: 'Net cumulative profit',
      icon: metrics.totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: metrics.totalPnL >= 0 ? 'green' : 'red',
      bgColor: metrics.totalPnL >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      iconBg: metrics.totalPnL >= 0 ? 'bg-green-500/20' : 'bg-red-500/20',
    },
    {
      label: 'WIN RATE',
      value: `${metrics.winRate}%`,
      format: 'text',
      subtitle: `${metrics.winningTrades} wins / ${metrics.totalTrades} trades`,
      icon: Target,
      color: parseFloat(metrics.winRate) >= 50 ? 'green' : 'red',
      bgColor: parseFloat(metrics.winRate) >= 50 ? 'bg-green-500/10' : 'bg-red-500/10',
      iconBg: parseFloat(metrics.winRate) >= 50 ? 'bg-green-500/20' : 'bg-red-500/20',
    },
    {
      label: 'AVG PROFIT',
      value: metrics.avgProfit,
      format: 'currency',
      subtitle: 'Per winning trade',
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-500/10',
      iconBg: 'bg-green-500/20',
    },
    {
      label: 'AVG LOSS',
      value: metrics.avgLoss,
      format: 'currency',
      subtitle: 'Per losing trade',
      icon: TrendingDown,
      color: 'red',
      bgColor: 'bg-red-500/10',
      iconBg: 'bg-red-500/20',
    },
    {
      label: 'PROFIT FACTOR',
      value: metrics.profitFactor,
      format: 'text',
      subtitle: 'Gross Profit / Gross Loss',
      icon: Activity,
      color: parseFloat(metrics.profitFactor) >= 1 ? 'green' : 'red',
      bgColor: parseFloat(metrics.profitFactor) >= 1 ? 'bg-green-500/10' : 'bg-red-500/10',
      iconBg: parseFloat(metrics.profitFactor) >= 1 ? 'bg-green-500/20' : 'bg-red-500/20',
    },
    {
      label: 'RISK-REWARD RATIO',
      value: metrics.riskRewardRatio,
      format: 'text',
      subtitle: 'Avg Win / Avg Loss',
      icon: BarChart3,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      iconBg: 'bg-blue-500/20',
    },
    {
      label: 'MAX DRAWDOWN',
      value: metrics.maxDrawdown,
      format: 'currency',
      subtitle: 'Maximum peak-to-trough decline',
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-500/10',
      iconBg: 'bg-red-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        const colorClass = card.color === 'green' ? 'text-green-400' : card.color === 'red' ? 'text-red-400' : 'text-blue-400'
        
        return (
          <div
            key={idx}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 hover:border-[#262626] transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <Icon className={`w-4 h-4 ${colorClass}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold mb-1 ${
              card.format === 'currency' && typeof card.value === 'number'
                ? card.value >= 0 ? 'text-green-400' : 'text-red-400'
                : 'text-white'
            }`}>
              {formatValue(card.value, card.format)}
            </div>
            <div className="text-[10px] text-gray-500">{card.subtitle}</div>
          </div>
        )
      })}
    </div>
  )
}
