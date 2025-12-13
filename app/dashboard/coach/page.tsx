import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CoachClient } from './CoachClient'
import { getCurrentActionPlan, generateWeeklyActionPlan } from '@/lib/action-plans'

export default async function CoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch recent insights (handle table not existing gracefully)
  const { data: insights, error: insightsError } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('user_id', user.id)
    .eq('dismissed', false)
    .order('created_at', { ascending: false })
    .limit(10)

  // If table doesn't exist, return empty array (table will be created by migration)
  if (insightsError && (insightsError.code === 'PGRST205' || insightsError.code === 'PGRST116' || insightsError.message?.includes('does not exist'))) {
    console.warn('ai_insights table does not exist yet. Please run the database migration.')
  }

  // Get current profile
  const { getCurrentProfileId } = await import('@/lib/profile-utils')
  const profileId = await getCurrentProfileId(user.id)

  // Fetch recent trades for context (filter by profile)
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
  
  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }
  
  const { data: trades } = await tradesQuery
    .order('trade_date', { ascending: false })
    .limit(50)

  // Get or generate current week's action plan
  let actionPlan = await getCurrentActionPlan(user.id)
  if (!actionPlan) {
    // Try to generate one if it doesn't exist
    actionPlan = await generateWeeklyActionPlan(user.id)
  }

  return <CoachClient initialInsights={insights || []} recentTrades={trades || []} actionPlan={actionPlan} />
}

