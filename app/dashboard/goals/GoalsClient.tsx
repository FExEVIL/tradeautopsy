'use client'

import { useState, useMemo, useEffect } from 'react'
import { Target, Plus, CheckCircle, TrendingUp, Calendar, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { formatINR } from '@/lib/formatters'
import { PnLIndicator } from '@/components/PnLIndicator'
import { format } from 'date-fns'
import { GoalCelebration } from './components/GoalCelebration'

interface Goal {
  id: string
  goal_type: string
  title: string
  target_value: number
  current_value: number
  deadline: string | null
  completed: boolean
  created_at: string
}

interface GoalsClientProps {
  initialGoals: Goal[]
  trades: any[]
}

export function GoalsClient({ initialGoals, trades }: GoalsClientProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [showAddModal, setShowAddModal] = useState(false)
  const [celebratingGoal, setCelebratingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    goal_type: 'profit',
    title: '',
    target_value: 0,
    deadline: ''
  })

  const supabase = createClient()

  // Track previous completion state to detect new completions
  const prevCompletedIds = useMemo(() => {
    return new Set(goals.filter(g => g.completed).map(g => g.id))
  }, [goals])

  // Calculate current values for goals based on trades
  const updatedGoals = useMemo(() => {
    const netPnL = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
    const wins = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0).length
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0

    return goals.map(goal => {
      let currentValue = goal.current_value
      const wasCompleted = goal.completed

      if (!goal.completed) {
        switch (goal.goal_type) {
          case 'profit':
            currentValue = netPnL
            break
          case 'win_rate':
            currentValue = winRate
            break
          case 'consistency':
            // Calculate consistency as % of days with trades
            const tradingDays = new Set(trades.map(t => new Date(t.trade_date).toISOString().split('T')[0])).size
            const totalDays = trades.length > 0 ? Math.ceil((new Date().getTime() - new Date(trades[trades.length - 1].trade_date).getTime()) / (1000 * 60 * 60 * 24)) : 0
            currentValue = totalDays > 0 ? (tradingDays / totalDays) * 100 : 0
            break
        }
      }

      const isNowCompleted = currentValue >= goal.target_value

      return {
        ...goal,
        current_value: currentValue,
        completed: goal.completed || isNowCompleted,
        wasCompleted
      }
    })
  }, [goals, trades])

  // Detect newly completed goals and trigger celebration
  useEffect(() => {
    const newlyCompleted = updatedGoals.find(g => 
      g.completed && !prevCompletedIds.has(g.id) && !g.wasCompleted
    )
    
    if (newlyCompleted) {
      // Update goal in database
      supabase
        .from('goals')
        .update({ completed: true })
        .eq('id', newlyCompleted.id)
        .then(() => {
          setCelebratingGoal(newlyCompleted)
          setGoals(updatedGoals.map(g => ({ ...g, wasCompleted: undefined })))
        })
    }
  }, [updatedGoals, prevCompletedIds, supabase])

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.target_value) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        goal_type: newGoal.goal_type,
        title: newGoal.title,
        target_value: newGoal.target_value,
        deadline: newGoal.deadline || null,
        current_value: 0
      })
      .select()
      .single()

    if (!error && data) {
      setGoals([...goals, data])
      setShowAddModal(false)
      setNewGoal({ goal_type: 'profit', title: '', target_value: 0, deadline: '' })
    }
  }

  const handleDeleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(goals.filter(g => g.id !== id))
  }

  const handleToggleComplete = async (goal: Goal) => {
    const newCompleted = !goal.completed
    await supabase
      .from('goals')
      .update({ completed: newCompleted })
      .eq('id', goal.id)

    setGoals(goals.map(g => g.id === goal.id ? { ...g, completed: newCompleted } : g))
    
    // Show celebration if manually marking as complete
    if (newCompleted) {
      setCelebratingGoal(goal)
    }
  }

  const handleShareGoal = async () => {
    if (!celebratingGoal) return
    
    const shareText = `I just achieved my trading goal: ${celebratingGoal.title}!\n\nTarget: ${celebratingGoal.target_value}\nAchieved: ${celebratingGoal.current_value}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Goal Achieved: ${celebratingGoal.title}`,
          text: shareText,
          url: window.location.href
        })
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        alert('Achievement copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const activeGoals = updatedGoals.filter(g => !g.completed)
  const completedGoals = updatedGoals.filter(g => g.completed)

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      profit: 'Profit Target',
      win_rate: 'Win Rate',
      consistency: 'Consistency',
      risk: 'Risk Management',
      behavioral: 'Behavioral'
    }
    return labels[type] || type
  }

  const getProgressPercentage = (goal: Goal) => {
    if (goal.target_value === 0) return 0
    return Math.min(100, (goal.current_value / goal.target_value) * 100)
  }

  return (
    <>
      {celebratingGoal && (
        <GoalCelebration
          goal={celebratingGoal}
          onClose={() => setCelebratingGoal(null)}
          onShare={handleShareGoal}
        />
      )}
      <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-400" />
              Goals & Milestones
            </h1>
            <p className="text-gray-400 text-sm mt-1">Track your trading goals and celebrate achievements</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </button>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Active Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGoals.map(goal => {
                const progress = getProgressPercentage(goal)
                const isProfit = goal.goal_type === 'profit'

                return (
                         <div
                           key={goal.id}
                           className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 hover:border-white/10 transition-colors"
                         >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {getGoalTypeLabel(goal.goal_type)}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{goal.title}</h3>
                        {goal.deadline && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-end justify-between mb-2">
                        {isProfit ? (
                          <PnLIndicator value={goal.current_value} size="lg" />
                        ) : (
                          <div className="text-2xl font-bold text-white">
                            {goal.current_value.toFixed(1)}{goal.goal_type === 'win_rate' || goal.goal_type === 'consistency' ? '%' : ''}
                          </div>
                        )}
                        <div className="text-sm text-gray-400">
                          of {isProfit ? formatINR(goal.target_value) : `${goal.target_value}${goal.goal_type === 'win_rate' || goal.goal_type === 'consistency' ? '%' : ''}`}
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% complete</div>
                    </div>

                    <button
                      onClick={() => handleToggleComplete(goal)}
                      className="w-full px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium"
                    >
                      Mark as Complete
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Completed Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedGoals.map(goal => (
                <div
                  key={goal.id}
                  className="p-6 rounded-xl bg-green-500/5 border border-green-500/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{getGoalTypeLabel(goal.goal_type)}</p>
                  <div className="text-xs text-gray-500">
                    Completed on {format(new Date(goal.created_at), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeGoals.length === 0 && completedGoals.length === 0 && (
          <div className="text-center py-12 bg-[#0F0F0F] border border-white/5 rounded-xl">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No goals set yet</p>
            <p className="text-sm text-gray-500 mb-4">Set your first goal to start tracking progress</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create New Goal</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goal Type</label>
                <select
                  value={newGoal.goal_type}
                  onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  <option value="profit">Profit Target (₹)</option>
                  <option value="win_rate">Win Rate (%)</option>
                  <option value="consistency">Consistency (%)</option>
                  <option value="risk">Risk Management</option>
                  <option value="behavioral">Behavioral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Reach ₹1L profit this month"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Value</label>
                <input
                  type="number"
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter target value"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deadline (Optional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddGoal}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Goal
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

