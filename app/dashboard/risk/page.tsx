import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { RiskClient } from './RiskClient'

export default async function RiskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get current profile
  const { getCurrentProfileId } = await import('@/lib/profile-utils')
  const profileId = await getCurrentProfileId(user.id)

  // Fetch all trades (filter by profile)
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
  
  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }
  
  const { data: trades } = await tradesQuery.order('trade_date', { ascending: true })

  return <RiskClient trades={trades || []} />
}

