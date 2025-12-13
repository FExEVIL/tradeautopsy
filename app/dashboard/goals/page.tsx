import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { GoalsClient } from './GoalsClient'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get current profile
  const { getCurrentProfileId } = await import('@/lib/profile-utils')
  const profileId = await getCurrentProfileId(user.id)

  // Fetch user's goals (handle table not existing gracefully, filter by profile)
  let goalsQuery = supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
  
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
    .eq('user_id', user.id)
    .is('deleted_at', null)
  
  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }
  
  const { data: trades } = await tradesQuery.order('trade_date', { ascending: false })

  return <GoalsClient initialGoals={goals || []} trades={trades || []} />
}

