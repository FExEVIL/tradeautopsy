import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertPreferencesClient } from './AlertPreferencesClient'

export default async function AlertPreferencesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user's alert preferences (handle table not existing gracefully)
  const { data: preferences, error: preferencesError } = await supabase
    .from('alert_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // If table doesn't exist, return null (table will be created by migration)
  if (preferencesError && (preferencesError.code === 'PGRST205' || preferencesError.code === 'PGRST116' || preferencesError.message?.includes('does not exist'))) {
    console.warn('alert_preferences table does not exist yet. Please run the database migration.')
  }

  return <AlertPreferencesClient initialPreferences={preferences} />
}

