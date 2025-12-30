import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { CoachClient } from './CoachClient'
import { getCurrentActionPlan, generateWeeklyActionPlan } from '@/lib/action-plans'

export default async function CoachPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  // Check Supabase auth
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check WorkOS auth (fallback)
  const workosUserId = cookieStore.get('workos_user_id')?.value
  const workosProfileId = cookieStore.get('workos_profile_id')?.value || cookieStore.get('active_profile_id')?.value
  
  // Must have either Supabase user OR WorkOS session
  if (!user && !workosUserId) {
    redirect('/login')
  }
  
  // Use effective user ID for queries
  const effectiveUserId = user?.id || workosProfileId

  // Fetch recent insights (handle table not existing gracefully)
  const { data: insights, error: insightsError } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('user_id', effectiveUserId)
    .eq('dismissed', false)
    .order('created_at', { ascending: false })
    .limit(10)

  // If table doesn't exist, return empty array (table will be created by migration)
  if (insightsError && (insightsError.code === 'PGRST205' || insightsError.code === 'PGRST116' || insightsError.message?.includes('does not exist'))) {
    console.warn('ai_insights table does not exist yet. Please run the database migration.')
  }

  // Get current profile
  const { getCurrentProfileId } = await import('@/lib/profile-utils')
  const profileId = effectiveUserId ? await getCurrentProfileId(effectiveUserId) : workosProfileId

  // Fetch recent trades for context (filter by profile)
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', effectiveUserId)
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

