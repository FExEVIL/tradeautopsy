import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { GoalsClient } from '@/app/goals/GoalsClient'
import { getCurrentProfileId } from '@/lib/profile-utils'

export default async function GoalsPage() {
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
  const profileId = effectiveUserId ? await getCurrentProfileId(effectiveUserId) : workosProfileId

  // Fetch user's goals (handle table not existing gracefully, filter by profile)
  let goalsQuery = supabase
    .from('goals')
    .select('*')
    .eq('user_id', effectiveUserId)
  
  if (profileId) {
    goalsQuery = goalsQuery.eq('profile_id', profileId)
  }
  
  const { data: goals, error: goalsError } = await goalsQuery.order('created_at', { ascending: false })

  // If table doesn't exist, return empty array (table will be created by migration)
  if (goalsError && (goalsError.code === 'PGRST205' || goalsError.code === 'PGRST116' || goalsError.message?.includes('does not exist'))) {
    console.warn('goals table does not exist yet. Please run the database migration.')
  }

  // Fetch recent trades for progress calculation (filter by profile)
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', effectiveUserId)
    .is('deleted_at', null)
  
  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }
  
  const { data: trades } = await tradesQuery.order('trade_date', { ascending: false })

  return <GoalsClient initialGoals={goals || []} trades={trades || []} />
}
