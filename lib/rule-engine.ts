import { createClient } from '@/utils/supabase/server'
import { Trade } from '@/types/trade'
import { format } from 'date-fns'

export interface TradingRule {
  id: string
  user_id: string
  rule_type: 'time_restriction' | 'trade_limit' | 'loss_limit' | 'behavioral' | 'strategy'
  title: string
  description: string | null
  rule_config: Record<string, any>
  enabled: boolean
  severity: 'warning' | 'blocking'
  created_at: string
  updated_at: string
}

export interface RuleViolation {
  rule: TradingRule
  message: string
  details: Record<string, any>
}

/**
 * Validate a trade against all enabled rules
 */
export async function validateTradeAgainstRules(
  userId: string,
  tradeData: Partial<Trade>
): Promise<{
  allowed: boolean
  violations: RuleViolation[]
}> {
  const supabase = await createClient()

  // Get current profile ID from trade data or user preferences
  const { getCurrentProfileId } = await import('@/lib/profile-utils')
  const profileId = tradeData.profile_id 
    ? String(tradeData.profile_id) 
    : await getCurrentProfileId(userId)

  // Get all enabled rules for user (filter by profile if available)
  let rulesQuery = supabase
    .from('trading_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('enabled', true)
  
  if (profileId) {
    rulesQuery = rulesQuery.eq('profile_id', profileId)
  }
  
  const { data: rules, error } = await rulesQuery

  if (error || !rules || rules.length === 0) {
    return { allowed: true, violations: [] }
  }

  const violations: RuleViolation[] = []

  // Check each rule
  for (const rule of rules) {
    const violation = await checkRule(rule, tradeData, userId, supabase)
    if (violation) {
      violations.push(violation)
    }
  }

  // Block if any blocking violations exist
  const blockingViolations = violations.filter(v => v.rule.severity === 'blocking')
  const allowed = blockingViolations.length === 0

  return { allowed, violations }
}

/**
 * Check a single rule against trade data
 */
async function checkRule(
  rule: TradingRule,
  tradeData: Partial<Trade>,
  userId: string,
  supabase: any
): Promise<RuleViolation | null> {
  const config = rule.rule_config
  const tradeDate = tradeData.trade_date ? new Date(tradeData.trade_date) : new Date()
  const hour = tradeDate.getHours()
  const dateStr = format(tradeDate, 'yyyy-MM-dd')

  switch (rule.rule_type) {
    case 'time_restriction': {
      // Check if trading after restricted hour
      if (config.after_hour !== undefined && hour >= config.after_hour) {
        return {
          rule,
          message: `Trading after ${config.after_hour}:00 is not allowed`,
          details: { hour, restrictedAfter: config.after_hour }
        }
      }
      // Check if trading before restricted hour
      if (config.before_hour !== undefined && hour < config.before_hour) {
        return {
          rule,
          message: `Trading before ${config.before_hour}:00 is not allowed`,
          details: { hour, restrictedBefore: config.before_hour }
        }
      }
      break
    }

    case 'trade_limit': {
      // Check daily trade count
      if (config.max_trades_per_day !== undefined) {
        const { data: todayTrades } = await supabase
          .from('trades')
          .select('id', { count: 'exact', head: false })
          .eq('user_id', userId)
          .gte('trade_date', `${dateStr}T00:00:00`)
          .lte('trade_date', `${dateStr}T23:59:59`)

        const todayCount = todayTrades?.length || 0
        if (todayCount >= config.max_trades_per_day) {
          return {
            rule,
            message: `Daily trade limit of ${config.max_trades_per_day} reached (${todayCount} trades today)`,
            details: { todayCount, maxTrades: config.max_trades_per_day }
          }
        }
      }
      break
    }

    case 'loss_limit': {
      // Check daily loss limit
      if (config.max_daily_loss !== undefined) {
        const { data: todayTrades } = await supabase
          .from('trades')
          .select('pnl')
          .eq('user_id', userId)
          .gte('trade_date', `${dateStr}T00:00:00`)
          .lte('trade_date', `${dateStr}T23:59:59`)

        const todayLoss = (todayTrades || []).reduce((sum: number, t: any) => {
          const pnl = parseFloat(String(t.pnl || '0'))
          return sum + (pnl < 0 ? pnl : 0)
        }, 0)

        if (Math.abs(todayLoss) >= config.max_daily_loss) {
          return {
            rule,
            message: `Daily loss limit of ₹${config.max_daily_loss} reached (₹${Math.abs(todayLoss).toFixed(0)} lost today)`,
            details: { todayLoss, maxLoss: config.max_daily_loss }
          }
        }
      }
      break
    }

    case 'behavioral': {
      // Check for revenge trading
      if (config.prevent_revenge_trading) {
        const { data: recentTrades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', userId)
          .order('trade_date', { ascending: false })
          .limit(1)

        if (recentTrades && recentTrades.length > 0) {
          const lastTrade = recentTrades[0]
          const lastPnL = parseFloat(String(lastTrade.pnl || '0'))
          const timeDiff = tradeDate.getTime() - new Date(lastTrade.trade_date).getTime()
          const minutesDiff = timeDiff / (1000 * 60)

          if (lastPnL < 0 && minutesDiff < 30) {
            return {
              rule,
              message: 'Revenge trading detected - trading within 30 minutes of a loss',
              details: { lastPnL, minutesSinceLoss: Math.round(minutesDiff) }
            }
          }
        }
      }
      break
    }

    case 'strategy': {
      // Check if trade matches allowed strategies
      if (config.allowed_strategies && Array.isArray(config.allowed_strategies)) {
        // This would need strategy classification
        // For now, skip this check
      }
      break
    }
  }

  return null
}

/**
 * Log a rule violation
 */
export async function logRuleViolation(
  userId: string,
  ruleId: string,
  tradeId: string | null,
  violationDetails: Record<string, any>
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('rule_violations').insert({
    user_id: userId,
    rule_id: ruleId,
    trade_id: tradeId,
    violation_details: violationDetails
  })

  // Update adherence stats
  await updateAdherenceStats(userId, false)
}

/**
 * Update rule adherence statistics
 */
export async function updateAdherenceStats(
  userId: string,
  tradeCompletedWithoutViolation: boolean
): Promise<void> {
  const supabase = await createClient()

  // Get current stats
  const { data: stats } = await supabase
    .from('rule_adherence_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  const today = format(new Date(), 'yyyy-MM-dd')

  // Get today's violations
  const { data: todayViolations } = await supabase
    .from('rule_violations')
    .select('id')
    .eq('user_id', userId)
    .gte('violation_time', `${today}T00:00:00`)
    .lte('violation_time', `${today}T23:59:59`)

  const hasViolationToday = (todayViolations?.length || 0) > 0

  // Get total trades
  const { count: totalTrades } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get total violations
  const { count: totalViolations } = await supabase
    .from('rule_violations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Calculate streak
  let currentStreak = stats?.current_streak || 0
  if (hasViolationToday) {
    currentStreak = 0
  } else if (tradeCompletedWithoutViolation) {
    // Check if this is a new day
    const lastUpdate = stats?.last_updated ? new Date(stats.last_updated) : null
    const lastUpdateDate = lastUpdate ? format(lastUpdate, 'yyyy-MM-dd') : null
    if (lastUpdateDate !== today) {
      currentStreak = (stats?.current_streak || 0) + 1
    }
  }

  const longestStreak = Math.max(currentStreak, stats?.longest_streak || 0)

  // Calculate adherence score (0-100)
  const adherenceScore = totalTrades && totalTrades > 0
    ? Math.max(0, Math.min(100, ((totalTrades - (totalViolations || 0)) / totalTrades) * 100))
    : 100

  // Upsert stats
  await supabase.from('rule_adherence_stats').upsert({
    user_id: userId,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    total_violations: totalViolations || 0,
    total_trades: totalTrades || 0,
    adherence_score: adherenceScore,
    badges: stats?.badges || [],
    last_updated: new Date().toISOString()
  }, {
    onConflict: 'user_id'
  })
}

/**
 * Get rule adherence statistics
 */
export async function getAdherenceStats(userId: string): Promise<{
  currentStreak: number
  longestStreak: number
  totalViolations: number
  totalTrades: number
  adherenceScore: number
  badges: string[]
} | null> {
  const supabase = await createClient()

  const { data: stats } = await supabase
    .from('rule_adherence_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!stats) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalViolations: 0,
      totalTrades: 0,
      adherenceScore: 100,
      badges: []
    }
  }

  return {
    currentStreak: stats.current_streak || 0,
    longestStreak: stats.longest_streak || 0,
    totalViolations: stats.total_violations || 0,
    totalTrades: stats.total_trades || 0,
    adherenceScore: parseFloat(String(stats.adherence_score || 100)),
    badges: (stats.badges as string[]) || []
  }
}

