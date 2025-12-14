'use client'

import { StatCard } from '@/components/ui/StatCard'
import { formatINR } from '@/lib/formatters'

interface StatsCardsProps {
  thisWeek: { pnl: number; trades: number; winRate: number }
  thisMonth: { pnl: number; trades: number; winRate: number }
  allTime: { pnl: number; trades: number; winRate: number }
}

export default function StatsCards({ thisWeek, thisMonth, allTime }: StatsCardsProps) {
  const cards = [
    { 
      title: 'This Week', 
      subtitle: 'Last 7 days', 
      data: thisWeek,
      icon: 'clock',
    },
    { 
      title: 'This Month', 
      subtitle: new Date().toLocaleDateString('en-IN', { month: 'long' }), 
      data: thisMonth,
      icon: 'calendar',
    },
    { 
      title: 'All Time', 
      subtitle: 'Total performance', 
      data: allTime,
      icon: 'trendingUp',
    },
  ]

  return (
    <div className="grid-3">
      {cards.map((card, i) => {
        const isPositive = card.data.pnl >= 0
        return (
          <StatCard
            key={i}
            label={card.title.toUpperCase()}
            value={formatINR(card.data.pnl)}
            subtitle={`${card.data.trades} trades • ${card.data.winRate.toFixed(1)}% win rate`}
            icon={card.icon}
            iconColor={isPositive ? 'green' : 'red'}
            valueColor="auto"
            variant="darker"
          />
        )
      })}
    </div>
  )
}
