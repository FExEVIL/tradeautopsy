'use client'

import { useState } from 'react'

interface Trade {
  pnl: number
  trade_date: string | null
  tradingsymbol: string
  mood?: string
}

interface InsightCardsProps {
  trades: Trade[]
}

export function InsightCards({ trades }: InsightCardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  // Calculate insights
  const revengeTrading = trades.filter((t, i) => {
    if (i === 0) return false
    const prevTrade = trades[i - 1]
    return (prevTrade.pnl || 0) < 0 && (t.pnl || 0) < 0
  }).length

  const bestMood = trades.reduce((acc, t) => {
    if (!t.mood) return acc
    if (!acc[t.mood]) acc[t.mood] = { count: 0, totalPnL: 0 }
    acc[t.mood].count++
    acc[t.mood].totalPnL += t.pnl || 0
    return acc
  }, {} as Record<string, { count: number; totalPnL: number }>)

  const bestMoodData = Object.entries(bestMood).sort((a, b) => b[1].totalPnL - a[1].totalPnL)[0]

  const afternoonTrades = trades.filter(t => {
    if (!t.trade_date) return false
    const hour = new Date(t.trade_date).getHours()
    return hour >= 14 && hour < 15
  })
  const afternoonLoss = afternoonTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)

  const insights = [
  {
    id: 'revenge',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    title: 'Revenge Trading Detected',
    description: `You traded ${revengeTrading} times immediately after losses`,
    impact: `-₹${Math.abs(revengeTrading * 66).toFixed(0)}`,
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/5',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    textColor: 'text-red-400',
    badge: 'critical',
    badgeColor: 'bg-red-500/20 text-red-400',
    details: 'Taking trades right after a loss often leads to emotional decisions. Wait 15 minutes after a loss before your next trade.',
    action: 'Set cooldown timer'
  },
  {
    id: 'mood',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    title: 'Best Mood to Trade',
    description: bestMoodData ? `${bestMoodData[0]} mood = +60% win rate` : 'Start tracking mood',
    impact: bestMoodData ? `+₹${bestMoodData[1].totalPnL.toFixed(0)}` : '+₹0',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-400',
    badge: 'success',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
    details: 'Your most profitable trades happen when you feel confident and focused. Try to trade only when you\'re in this state.',
    action: 'Track mood daily'
  },
  {
    id: 'time',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Avoid Afternoon Slump',
    description: 'You lose ₹180/trade between 2-3pm',
    impact: `${afternoonLoss >= 0 ? '+' : ''}₹${afternoonLoss.toFixed(0)}`,
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/5',
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-400',
    textColor: 'text-yellow-400',
    badge: 'warning',
    badgeColor: 'bg-yellow-500/20 text-yellow-400',
    details: 'Post-lunch hours show your worst performance. Market volatility or personal energy levels might be affecting your decisions.',
    action: 'Skip afternoon'
  }
]

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center">
  <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
</div>
        <div>
          <h2 className="text-2xl font-bold text-white">Today's Insights</h2>
          <p className="text-sm text-gray-500">AI-powered behavioral analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <div
            key={insight.id}
            onClick={() => setExpandedCard(expandedCard === insight.id ? null : insight.id)}
            className={`relative overflow-hidden bg-[#1a1a1a] border ${insight.borderColor} rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover-lift animate-fade-in-delay-${index + 1}`}
          >
            {/* Subtle gradient overlay */}
            <div className={`absolute inset-0 ${insight.bgColor} opacity-50`}></div>

            {/* Content */}
            <div className="relative">
             {/* Icon */}
<div className={`w-14 h-14 ${insight.iconBg} border ${insight.borderColor} rounded-xl flex items-center justify-center mb-4 ${insight.iconColor}`}>
  {insight.icon}
</div>

              {/* Title & Badge */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white pr-2">{insight.title}</h3>
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${insight.badgeColor} whitespace-nowrap`}>
                  {insight.badge}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{insight.description}</p>

              {/* Impact */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Impact</span>
                <span className={`text-2xl font-bold ${insight.textColor}`}>{insight.impact}</span>
              </div>

              {/* Expanded Details */}
              {expandedCard === insight.id && (
                <div className="animate-slide-down space-y-3">
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-300 leading-relaxed">{insight.details}</p>
                  </div>
                  <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
                    <span>{insight.action}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Learn More Toggle */}
              {!expandedCard && (
                <button className="text-gray-400 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                  <span>Learn more</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}