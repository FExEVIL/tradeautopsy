import { createClient } from '@/utils/supabase/server'
import { format, startOfWeek, addWeeks } from 'date-fns'
import { detectPatterns } from './ai-coach'

export interface ActionPlan {
  id: string
  week_start: string
  focus_area: string
  goals: Record<string, number>
  progress: Record<string, number>
  completed: boolean
  created_at: string
  updated_at: string
}

/**
 * Generate a weekly action plan based on detected patterns and recent performance
 */
export async function generateWeeklyActionPlan(userId: string): Promise<ActionPlan | null> {
  const supabase = await createClient()

  // Get current week start (Monday)
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')

  // Check if plan already exists for this week
  const { data: existingPlan } = await supabase
    .from('action_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStartStr)
    .single()

  if (existingPlan) {
    return existingPlan as ActionPlan
  }

  // Get recent trades (last 30 days)
  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .gte('trade_date', format(addWeeks(now, -4), 'yyyy-MM-dd'))
    .order('trade_date', { ascending: false })

  if (!trades || trades.length < 5) {
    return null // Need at least 5 trades to generate a meaningful plan
  }

  // Detect patterns
  const patterns = detectPatterns(trades as any[])

  // Calculate metrics
  const winRate = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0).length / trades.length * 100
  const netPnL = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
  const avgTrade = netPnL / trades.length

  // Determine focus area based on patterns and performance
  let focusArea = 'position_sizing'
  const goals: Record<string, number> = {}

  // Check for revenge trading
  const revengePattern = patterns.find(p => p.type === 'revenge_trading')
  if (revengePattern && revengePattern.frequency >= 2) {
    focusArea = 'revenge_trading'
    goals.reduce_revenge_trades = Math.max(50, Math.round(revengePattern.frequency * 0.5))
    goals.improve_win_rate = Math.max(5, Math.round((60 - winRate) / 2))
  }
  // Check for overtrading
  else if (patterns.find(p => p.type === 'overtrading')) {
    focusArea = 'overtrading'
    const dailyTrades = trades.length / 30 // Average trades per day
    goals.max_trades_per_day = Math.max(3, Math.round(dailyTrades * 0.7))
    goals.improve_win_rate = Math.max(5, Math.round((60 - winRate) / 2))
  }
  // Check for FOMO
  else if (patterns.find(p => p.type === 'fomo')) {
    focusArea = 'fomo'
    goals.reduce_fomo_trades = 30 // 30% reduction
    goals.improve_win_rate = Math.max(5, Math.round((60 - winRate) / 2))
  }
  // Check for low win rate
  else if (winRate < 50) {
    focusArea = 'stop_loss'
    goals.improve_win_rate = Math.max(10, Math.round(60 - winRate))
    goals.reduce_avg_loss = Math.max(20, Math.round(Math.abs(avgTrade) * 0.3))
  }
  // Check for position sizing issues
  else {
    focusArea = 'position_sizing'
    goals.maintain_win_rate = Math.max(winRate, 55)
    goals.increase_avg_profit = Math.max(10, Math.round(avgTrade * 0.2))
  }

  // Create action plan
  const { data: newPlan, error } = await supabase
    .from('action_plans')
    .insert({
      user_id: userId,
      week_start: weekStartStr,
      focus_area: focusArea,
      goals,
      progress: {},
      completed: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating action plan:', error)
    return null
  }

  return newPlan as ActionPlan
}

/**
 * Update action plan progress
 */
export async function updateActionPlanProgress(
  userId: string,
  weekStart: string,
  progress: Record<string, number>
): Promise<ActionPlan | null> {
  const supabase = await createClient()

  // Get current progress
  const { data: plan } = await supabase
    .from('action_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .single()

  if (!plan) {
    return null
  }

  // Merge with existing progress
  const updatedProgress = {
    ...(plan.progress as Record<string, number> || {}),
    ...progress
  }

  // Check if goals are met
  const goals = plan.goals as Record<string, number>
  let completed = true
  for (const [key, target] of Object.entries(goals)) {
    const current = updatedProgress[key] || 0
    if (current < target) {
      completed = false
      break
    }
  }

  // Update plan
  const { data: updatedPlan, error } = await supabase
    .from('action_plans')
    .update({
      progress: updatedProgress,
      completed,
      updated_at: new Date().toISOString()
    })
    .eq('id', plan.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating action plan:', error)
    return null
  }

  return updatedPlan as ActionPlan
}

/**
 * Get current week's action plan
 */
export async function getCurrentActionPlan(userId: string): Promise<ActionPlan | null> {
  const supabase = await createClient()

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')

  const { data: plan, error } = await supabase
    .from('action_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStartStr)
    .single()

  if (error || !plan) {
    return null
  }

  return plan as ActionPlan
}

/**
 * Get all action plans for user
 */
export async function getAllActionPlans(userId: string): Promise<ActionPlan[]> {
  const supabase = await createClient()

  const { data: plans, error } = await supabase
    .from('action_plans')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(12) // Last 12 weeks

  if (error || !plans) {
    return []
  }

  return plans as ActionPlan[]
}

