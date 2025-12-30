import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AutomationSettingsClient from './AutomationSettingsClient'
import { ErrorState } from '../../components/ErrorState'

export const dynamic = 'force-dynamic'

export default async function AutomationSettingsPage() {
  try {
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

    // Fetch automation preferences (handle table not existing gracefully)
    const { data: preferences, error } = await supabase
      .from('automation_preferences')
      .select('*')
      .eq('user_id', effectiveUserId)
      .single()

    // If table doesn't exist, return defaults (not an error)
    if (error && (error.code === 'PGRST205' || error.code === 'PGRST116' || error.message?.includes('does not exist'))) {
      return <AutomationSettingsClient initialPreferences={null} />
    }

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected if no preferences set)
      throw error
    }

    return <AutomationSettingsClient initialPreferences={preferences || null} />
  } catch (error: any) {
    console.error('Automation settings page error:', error)
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <ErrorState 
          message={error.message || 'Failed to load automation settings'}
          fullScreen={true}
        />
      </div>
    )
  }
}

