import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import MLInsightsClient from './MLInsightsClient'

export default async function MLInsightsPage() {
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

  // Fetch ML insights
  const { data: insights, error } = await supabase
    .from('ml_insights')
    .select('*')
    .eq('user_id', effectiveUserId)
    .eq('acknowledged', false)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching ML insights:', error)
  }

  return <MLInsightsClient initialInsights={insights || []} />
}
