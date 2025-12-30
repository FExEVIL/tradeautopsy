import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AlertPreferencesClient } from './AlertPreferencesClient'

export default async function AlertPreferencesPage() {
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

  // Fetch user's alert preferences (handle table not existing gracefully)
  const { data: preferences, error: preferencesError } = await supabase
    .from('alert_preferences')
    .select('*')
    .eq('user_id', effectiveUserId)
    .single()

  // If table doesn't exist, return null (table will be created by migration)
  if (preferencesError && (preferencesError.code === 'PGRST205' || preferencesError.code === 'PGRST116' || preferencesError.message?.includes('does not exist'))) {
    console.warn('alert_preferences table does not exist yet. Please run the database migration.')
  }

  return <AlertPreferencesClient initialPreferences={preferences} />
}

