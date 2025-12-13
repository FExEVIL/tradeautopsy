'use client'

import { AlertTriangle, TrendingDown, Lightbulb, TrendingUp, Calendar } from 'lucide-react'
import { formatINR } from '@/lib/formatters'
import { format } from 'date-fns'

const PATTERN_CONFIG: Record<string, {
  title: string
  description: string
  icon: typeof AlertTriangle
  color: string
  howToFix: string[]
}> = {
  revenge_trading: {
    title: 'Revenge Trading',
    description: 'Trading impulsively after a loss to recover quickly',
    icon: AlertTriangle,
    color: 'red',
    howToFix: [
      'Take a 15-minute break after any loss',
      'Set a daily loss limit and stop when hit',
      'Journal your emotions after losses',
      'Review your trading plan before re-entering'
    ]
  },
  revenge_sizing: {
    title: 'Revenge Sizing',
    description: 'Increasing position size after losses to recover quickly',
    icon: AlertTriangle,
    color: 'red',
    howToFix: [
      'Maintain consistent position sizing regardless of recent results',
      'Never increase size after a loss',
      'Stick to your risk management rules (1-2% per trade)',
      'Review position sizing rules weekly'
    ]
  },
  fomo: {
    title: 'FOMO (Fear of Missing Out)',
    description: 'Jumping into trades during high volatility without a plan',
    icon: TrendingDown,
    color: 'yellow',
    howToFix: [
      'Only trade during your planned hours (avoid 10-11 AM, 2-3 PM)',
      'Wait for your setup confirmation before entering',
      'Use a pre-trade checklist',
      'Set alerts for your preferred entry times'
    ]
  },
  overtrading: {
    title: 'Overtrading',
    description: 'Taking too many trades in a single day',
    icon: AlertTriangle,
    color: 'orange',
    howToFix: [
      'Set a max of 3-5 trades per day',
      'Focus on quality over quantity',
      'Track your best trade count vs results',
      'Take breaks between trades to reassess'
    ]
  },
  win_streak_overconfidence: {
    title: 'Win Streak Overconfidence',
    description: 'Increasing position size after consecutive wins',
    icon: TrendingUp,
    color: 'purple',
    howToFix: [
      'Maintain consistent position sizing',
      'Don\'t increase size after wins',
      'Stick to your risk management rules',
      'Review your risk-reward ratio regularly'
    ]
  },
  weekend_warrior: {
    title: 'Weekend Warrior',
    description: 'Trading on weekends when markets are typically closed',
    icon: Calendar,
    color: 'blue',
    howToFix: [
      'Avoid trading on weekends (markets are closed)',
      'Use weekends for planning and review',
      'Set calendar reminders for market hours',
      'Focus on analysis and strategy refinement'
    ]
  },
  news_trader: {
    title: 'News Trader',
    description: 'Trading during high volatility opening/closing periods',
    icon: TrendingDown,
    color: 'yellow',
    howToFix: [
      'Avoid first 30 minutes and last 30 minutes of market',
      'Wait for volatility to settle before entering',
      'Focus on mid-day trading when volatility is lower',
      'Use limit orders instead of market orders'
    ]
  },
  loss_aversion: {
    title: 'Loss Aversion',
    description: 'Cutting winners early while holding losers too long',
    icon: TrendingDown,
    color: 'red',
    howToFix: [
      'Let winners run to your target (don\'t exit early)',
      'Cut losses quickly at your stop loss',
      'Use trailing stops for winners',
      'Review your risk-reward ratio (aim for 1:2 minimum)'
    ]
  }
}

export function PatternCard({ pattern }: { pattern: any }) {
  const config = PATTERN_CONFIG[pattern.type as keyof typeof PATTERN_CONFIG]
  
  if (!config) {
    // Unknown pattern type - show generic card
    return (
      <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
        <h3 className="font-semibold text-white mb-2">{pattern.type}</h3>
        <div className="text-xs text-gray-400">
          <p>Occurrences: {pattern.occurrences}</p>
          <p>Cost: {formatINR(Math.abs(pattern.totalCost))}</p>
        </div>
      </div>
    )
  }

  const Icon = config.icon
  const colorClasses = {
    red: {
      icon: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400'
    },
    yellow: {
      icon: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400'
    },
    orange: {
      icon: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      text: 'text-orange-400'
    },
    purple: {
      icon: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400'
    },
    blue: {
      icon: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400'
    }
  }

  const colors = colorClasses[config.color as keyof typeof colorClasses] || colorClasses.red

  return (
    <div className={`p-6 rounded-xl bg-[#0F0F0F] border ${colors.border} hover:border-white/10 transition-colors`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{config.title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{config.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Occurrences</div>
          <div className="text-2xl font-mono font-bold text-white">{pattern.occurrences}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Cost</div>
          <div className={`text-2xl font-mono font-bold ${colors.text}`}>
            {formatINR(Math.abs(pattern.totalCost))}
          </div>
        </div>
      </div>

      {/* Detection Info */}
      {pattern.firstDetected && (
        <div className="mb-4 pt-4 border-t border-white/5">
          <div className="text-xs text-gray-500">
            First detected: {format(new Date(pattern.firstDetected), 'MMM dd, yyyy')}
          </div>
          {pattern.lastDetected && pattern.lastDetected !== pattern.firstDetected && (
            <div className="text-xs text-gray-500 mt-1">
              Last detected: {format(new Date(pattern.lastDetected), 'MMM dd, yyyy')}
            </div>
          )}
        </div>
      )}

      {/* How to Fix */}
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">How to Fix</span>
        </div>
        <ul className="space-y-2">
          {config.howToFix.map((tip, idx) => (
            <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
              <span className={`${colors.icon} mt-1`}>•</span>
              <span className="flex-1">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

