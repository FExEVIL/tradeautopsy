import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import NotificationsSettingsClient from './NotificationsSettingsClient'

export default async function NotificationsSettingsPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  const workosUserId = cookieStore.get('workos_user_id')?.value
  
  if (authError || (!user && !workosUserId)) {
    redirect('/auth/login')
  }

  const effectiveUserId = user?.id || workosUserId

  // Get email preferences
  const { data: preferences } = await supabase
    .from('email_preferences')
    .select('*')
    .eq('user_id', effectiveUserId)
    .single()

  return (
    <NotificationsSettingsClient initialPreferences={preferences || null} />
  )
}

