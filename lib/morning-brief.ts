import { createClient } from '@/utils/supabase/server'
import { format, subDays, startOfDay } from 'date-fns'

export interface MorningBrief {
  yesterdayPnL: number
  yesterdayWinRate: number
  yesterdayTrades: number
  rulesViolated: Array<{ rule: string; count: number }>
  focusPoints: string[]
  todayEvents: Array<{ title: string; time: string; impact: string }>
  lastReadAt?: string
}

/**
 * Generate morning brief for user
 */
export async function generateMorningBrief(userId: string, profileId?: string | null): Promise<MorningBrief> {
  const supabase = await createClient()
  const today = startOfDay(new Date())
  const yesterday = subDays(today, 1)

  // Get yesterday's trades
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('trade_date', format(yesterday, 'yyyy-MM-dd'))
    .lt('trade_date', format(today, 'yyyy-MM-dd'))

  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }

  const { data: yesterdayTrades } = await tradesQuery

  const trades = yesterdayTrades || []
  const yesterdayPnL = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
  const wins = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0)
  const yesterdayWinRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0

  // Get rule violations from yesterday
  const { data: violations } = await supabase
    .from('rule_violations')
    .select('rule_id, trading_rules(title)')
    .eq('user_id', userId)
    .gte('violation_time', format(yesterday, 'yyyy-MM-dd'))
    .lt('violation_time', format(today, 'yyyy-MM-dd'))

  const rulesViolated: Array<{ rule: string; count: number }> = []
  if (violations) {
    const violationCounts: Record<string, number> = {}
    violations.forEach(v => {
      const ruleTitle = (v.trading_rules as any)?.title || 'Unknown Rule'
      violationCounts[ruleTitle] = (violationCounts[ruleTitle] || 0) + 1
    })
    Object.entries(violationCounts).forEach(([rule, count]) => {
      rulesViolated.push({ rule, count })
    })
  }

  // Get focus points from AI insights or patterns
  const { data: recentInsights } = await supabase
    .from('ai_insights')
    .select('insight_text')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3)

  const focusPoints = recentInsights?.map(i => i.insight_text) || []

  // Get today's high-impact economic events
  const { data: todayEvents } = await supabase
    .from('economic_events')
    .select('*')
    .eq('event_date', format(today, 'yyyy-MM-dd'))
    .eq('impact', 'high')
    .order('event_time', { ascending: true })
    .limit(3)

  const events = (todayEvents || []).map(e => ({
    title: e.title,
    time: e.event_time ? format(new Date(e.event_time), 'HH:mm') : 'All Day',
    impact: e.impact
  }))

  return {
    yesterdayPnL,
    yesterdayWinRate,
    yesterdayTrades: trades.length,
    rulesViolated,
    focusPoints,
    todayEvents: events
  }
}

/**
 * Check if user has read today's brief
 */
export async function hasReadTodayBrief(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('morning_brief_last_read')
    .eq('user_id', userId)
    .single()

  if (!prefs?.morning_brief_last_read) return false

  const lastRead = format(new Date(prefs.morning_brief_last_read), 'yyyy-MM-dd')
  return lastRead === today
}

/**
 * Mark brief as read
 */
export async function markBriefAsRead(userId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      morning_brief_last_read: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
}
