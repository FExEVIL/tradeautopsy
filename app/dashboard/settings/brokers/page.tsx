import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import BrokersClient from './BrokersClient'

export default async function BrokersPage() {
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

  // Fetch user's brokers
  const { data: brokers, error } = await supabase
    .from('brokers')
    .select('*')
    .eq('user_id', effectiveUserId)
    .order('created_at', { ascending: false })

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching brokers:', error)
  }

  // Fetch profiles for broker-profile associations
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', effectiveUserId)

  return <BrokersClient initialBrokers={brokers || []} profiles={profiles || []} />
}
