import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AutomationSettingsClient from './AutomationSettingsClient'
import { ErrorState } from '../../components/ErrorState'

export const dynamic = 'force-dynamic'

export default async function AutomationSettingsPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch automation preferences (handle table not existing gracefully)
    const { data: preferences, error } = await supabase
      .from('automation_preferences')
      .select('*')
      .eq('user_id', user.id)
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

