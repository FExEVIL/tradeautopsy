import { Trade } from '@/lib/intelligence/core/types'

export interface Goal {
  id: string
  user_id: string
  type: 'performance' | 'discipline' | 'consistency' | 'growth'
  title: string
  target: number
  current: number
  unit: string
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  deadline?: string
  created_at: string
  updated_at: string
}

export class AutoGoalSystem {
  static async generateGoals(trades: Trade[], userId: string): Promise<Goal[]> {
    const goals: Goal[] = []

    // Calculate current metrics
    const wins = trades.filter(t => t.pnl > 0).length
    const totalTrades = trades.length
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

    // Goal 1: Improve Win Rate
    if (winRate < 50 && totalTrades >= 10) {
      goals.push({
        id: `goal_winrate_${Date.now()}`,
        user_id: userId,
        type: 'performance',
        title: 'Achieve 50% Win Rate',
        target: 50,
        current: winRate,
        unit: '%',
        status: 'in_progress',
        deadline: this.getDeadline(30), // 30 days
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Goal 2: Complete Minimum Trades
    if (totalTrades < 20) {
      goals.push({
        id: `goal_volume_${Date.now()}`,
        user_id: userId,
        type: 'consistency',
        title: 'Complete 20 Trades',
        target: 20,
        current: totalTrades,
        unit: 'trades',
        status: 'in_progress',
        deadline: this.getDeadline(30),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Goal 3: Positive Profit Factor
    const grossProfit = trades
      .filter(t => t.pnl > 0)
      .reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(
      trades
        .filter(t => t.pnl < 0)
        .reduce((sum, t) => sum + t.pnl, 0)
    )
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0

    if (profitFactor < 1.5 && totalTrades >= 10) {
      goals.push({
        id: `goal_pf_${Date.now()}`,
        user_id: userId,
        type: 'performance',
        title: 'Achieve 1.5 Profit Factor',
        target: 1.5,
        current: profitFactor,
        unit: 'ratio',
        status: 'in_progress',
        deadline: this.getDeadline(60),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Goal 4: Reduce Max Loss
    const losses = trades
      .filter(t => t.pnl < 0)
      .map(t => Math.abs(t.pnl))
    const maxLoss = losses.length > 0 ? Math.max(...losses) : 0

    if (maxLoss > 1000 && totalTrades >= 5) {
      goals.push({
        id: `goal_maxloss_${Date.now()}`,
        user_id: userId,
        type: 'discipline',
        title: 'Keep Max Loss Under ₹1000',
        target: 1000,
        current: maxLoss,
        unit: '₹',
        status: 'in_progress',
        deadline: this.getDeadline(30),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Goal 5: Consistency (trade at least 3 days per week)
    const tradingDays = new Set(
      trades.map(t => {
        const date = new Date(t.entry_time || t.created_at)
        return date.toISOString().split('T')[0]
      })
    ).size
    const weeksTrading = Math.max(1, Math.ceil(tradingDays / 7))
    const avgDaysPerWeek = tradingDays / weeksTrading

    if (avgDaysPerWeek < 3 && totalTrades >= 10) {
      goals.push({
        id: `goal_consistency_${Date.now()}`,
        user_id: userId,
        type: 'consistency',
        title: 'Trade at Least 3 Days Per Week',
        target: 3,
        current: avgDaysPerWeek,
        unit: 'days/week',
        status: 'in_progress',
        deadline: this.getDeadline(30),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    return goals
  }

  static updateGoalProgress(goal: Goal, currentValue: number): Goal {
    const updatedGoal = {
      ...goal,
      current: currentValue,
      updated_at: new Date().toISOString(),
    }

    // Check completion
    if (goal.type === 'performance' || goal.type === 'consistency') {
      if (currentValue >= goal.target) {
        updatedGoal.status = 'completed'
      }
    } else if (goal.type === 'discipline') {
      // For discipline goals, lower is better
      if (currentValue <= goal.target) {
        updatedGoal.status = 'completed'
      }
    }

    // Check if deadline passed
    if (goal.deadline && new Date(goal.deadline) < new Date()) {
      if (updatedGoal.status !== 'completed') {
        updatedGoal.status = 'failed'
      }
    }

    return updatedGoal
  }

  private static getDeadline(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString()
  }
}
