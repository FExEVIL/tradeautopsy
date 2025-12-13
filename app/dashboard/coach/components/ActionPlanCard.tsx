'use client'

import { CheckCircle, Target, TrendingUp, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface ActionPlan {
  id: string
  week_start: string
  focus_area: string
  goals: Record<string, number>
  progress: Record<string, number>
  completed: boolean
  created_at: string
  updated_at: string
}

interface ActionPlanCardProps {
  plan: ActionPlan
}

const FOCUS_AREA_LABELS: Record<string, string> = {
  revenge_trading: 'Reduce Revenge Trading',
  overtrading: 'Control Overtrading',
  fomo: 'Avoid FOMO Trades',
  stop_loss: 'Improve Stop Loss',
  position_sizing: 'Optimize Position Sizing'
}

const FOCUS_AREA_DESCRIPTIONS: Record<string, string> = {
  revenge_trading: 'Focus on taking breaks after losses and avoiding emotional trading',
  overtrading: 'Limit daily trades and focus on quality setups only',
  fomo: 'Wait for proper setup confirmation before entering trades',
  stop_loss: 'Tighten stop losses and improve risk management',
  position_sizing: 'Maintain consistent position sizing based on risk'
}

export function ActionPlanCard({ plan }: ActionPlanCardProps) {
  const weekStart = parseISO(plan.week_start)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const goals = plan.goals || {}
  const progress = plan.progress || {}

  const getProgressPercentage = (goalKey: string, target: number): number => {
    const current = progress[goalKey] || 0
    return Math.min(100, Math.round((current / target) * 100))
  }

  return (
    <div className={`p-6 rounded-xl border ${
      plan.completed 
        ? 'bg-green-500/5 border-green-500/20' 
        : 'bg-[#0F0F0F] border-white/5'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">
              {FOCUS_AREA_LABELS[plan.focus_area] || plan.focus_area}
            </h3>
            {plan.completed && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
          <p className="text-sm text-gray-400 mb-2">
            {FOCUS_AREA_DESCRIPTIONS[plan.focus_area] || 'Weekly improvement plan'}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
        {plan.completed && (
          <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
            Completed
          </div>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(goals).map(([key, target]) => {
          const current = progress[key] || 0
          const percentage = getProgressPercentage(key, target)
          const goalLabel = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">{goalLabel}</span>
                <span className="text-sm font-medium text-white">
                  {current.toFixed(1)} / {target}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    percentage >= 100
                      ? 'bg-green-500'
                      : percentage >= 50
                      ? 'bg-blue-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {!plan.completed && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500">
            Keep trading to track your progress. Goals will update automatically.
          </p>
        </div>
      )}
    </div>
  )
}

