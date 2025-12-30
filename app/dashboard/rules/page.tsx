import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import RulesClient from './RulesClient'
import { getAdherenceStats } from '@/lib/rule-engine'
import { ErrorState } from '../components/ErrorState'

export const dynamic = 'force-dynamic'

export default async function RulesPage() {
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

    // Get current profile
    const { getCurrentProfileId } = await import('@/lib/profile-utils')
    const profileId = effectiveUserId ? await getCurrentProfileId(effectiveUserId) : workosProfileId

    // Fetch rules (handle table not existing gracefully, filter by profile)
    let rulesQuery = supabase
      .from('trading_rules')
      .select('*')
      .eq('user_id', effectiveUserId)
    
    if (profileId) {
      rulesQuery = rulesQuery.eq('profile_id', profileId)
    }
    
    const { data: rules, error: rulesError } = await rulesQuery.order('created_at', { ascending: false })

    if (rulesError && (rulesError.code === 'PGRST205' || rulesError.code === 'PGRST116' || rulesError.message?.includes('does not exist'))) {
      // Table doesn't exist - return empty state
      return <RulesClient initialRules={[]} adherenceStats={null} />
    }

    if (rulesError) {
      throw rulesError
    }

    // Get adherence stats
    let adherenceStats = null
    try {
      adherenceStats = await getAdherenceStats(effectiveUserId)
    } catch (statsError) {
      // Stats might fail if table doesn't exist - that's okay
      console.warn('Could not fetch adherence stats:', statsError)
    }

    return <RulesClient initialRules={rules || []} adherenceStats={adherenceStats} />
  } catch (error: any) {
    console.error('Rules page error:', error)
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <ErrorState 
          message={error.message || 'Failed to load trading rules'}
          fullScreen={true}
        />
      </div>
    )
  }
}

