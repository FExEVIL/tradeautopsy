'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Target, TrendingUp, Calendar, Check, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GoalStepProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onComplete: (data: { goal: any }) => void
}

export function GoalStep({ onNext, onBack, onSkip, onComplete }: GoalStepProps) {
  const router = useRouter()
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [customGoal, setCustomGoal] = useState({ type: '', target: '', period: '' })
  const [isCreating, setIsCreating] = useState(false)

  const presetGoals = [
    {
      id: 'daily_pnl',
      icon: TrendingUp,
      title: 'Daily P&L Target',
      description: 'Achieve ₹5,000 profit per day',
      type: 'daily_pnl',
      target: '5000',
      period: 'daily',
      gradient: 'from-green-primary/20 to-green-primary/5',
      iconBg: 'bg-green-subtle',
      iconColor: 'text-green-primary',
      borderColor: 'border-green-border',
    },
    {
      id: 'win_rate',
      icon: Target,
      title: 'Weekly Win Rate',
      description: 'Maintain 60% win rate this week',
      type: 'win_rate',
      target: '60',
      period: 'weekly',
      gradient: 'from-blue-primary/20 to-blue-primary/5',
      iconBg: 'bg-blue-subtle',
      iconColor: 'text-blue-primary',
      borderColor: 'border-blue-border',
    },
    {
      id: 'monthly_profit',
      icon: Calendar,
      title: 'Monthly Profit',
      description: 'Earn ₹50,000 profit this month',
      type: 'monthly_profit',
      target: '50000',
      period: 'monthly',
      gradient: 'from-purple-primary/20 to-purple-primary/5',
      iconBg: 'bg-purple-subtle',
      iconColor: 'text-purple-primary',
      borderColor: 'border-purple-border',
    },
  ]

  const handleSelectPreset = (goal: typeof presetGoals[0]) => {
    setSelectedGoal(goal.id)
    setCustomGoal({
      type: goal.type,
      target: goal.target,
      period: goal.period,
    })
  }

  const handleCreateGoal = async () => {
    if (!selectedGoal && !customGoal.type) {
      return
    }

    setIsCreating(true)

    try {
      const goalData = {
        name: presetGoals.find((g) => g.id === selectedGoal)?.title || 'Custom Goal',
        type: customGoal.type,
        target: parseFloat(customGoal.target),
        period: customGoal.period,
        start_date: new Date().toISOString(),
      }

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      })

      if (response.ok) {
        onComplete({ goal: goalData })
        onNext()
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">
          Set Your First Trading Goal
        </h2>
        <p className="text-text-secondary text-center mb-8">
          Goals help you stay focused and track your progress
        </p>
      </motion.div>

      {/* Preset goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {presetGoals.map((goal, i) => {
          const Icon = goal.icon
          const isSelected = selectedGoal === goal.id
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => handleSelectPreset(goal)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-5 bg-gradient-to-b ${goal.gradient} border-2 rounded-xl text-left transition-all duration-300 group ${
                isSelected
                  ? `${goal.borderColor} ring-2 ring-offset-2 ring-offset-bg-card ring-green-primary/30`
                  : 'border-border-subtle hover:border-border-default'
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-green-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}

              <div className={`w-12 h-12 ${goal.iconBg} rounded-xl flex items-center justify-center mb-4 border border-border-subtle group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${goal.iconColor}`} />
              </div>
              <h3 className="text-text-primary font-semibold mb-2">{goal.title}</h3>
              <p className="text-text-tertiary text-sm">{goal.description}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Custom goal option */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-bg-card border border-border-subtle rounded-xl p-4 mb-6"
      >
        <p className="text-sm text-text-tertiary mb-3">Or create a custom goal:</p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Goal name"
            className="flex-1 px-4 py-2.5 bg-bg-app border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:border-green-primary focus:ring-1 focus:ring-green-primary/30 transition-all"
            onChange={(e) => {
              setSelectedGoal(null)
              setCustomGoal({ ...customGoal, type: e.target.value })
            }}
          />
          <input
            type="number"
            placeholder="Target"
            className="w-32 px-4 py-2.5 bg-bg-app border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:border-green-primary focus:ring-1 focus:ring-green-primary/30 transition-all"
            onChange={(e) => setCustomGoal({ ...customGoal, target: e.target.value })}
          />
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-between pt-6 border-t border-border-subtle"
      >
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-2 hover:bg-border-subtle rounded-lg"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="px-5 py-2.5 text-text-tertiary hover:text-text-primary transition-colors font-medium"
          >
            Skip for now
          </button>
          {(selectedGoal || customGoal.type) && (
            <button
              onClick={handleCreateGoal}
              disabled={isCreating}
              className="px-6 py-2.5 bg-gradient-to-r from-green-primary to-green-hover text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-green-primary/20 hover:shadow-green-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Set Goal
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
