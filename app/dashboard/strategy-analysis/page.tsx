import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCurrentProfileId } from '@/lib/profile-utils'
import StrategyAnalysisClient from './StrategyAnalysisClient'
import { ErrorState } from '../components/ErrorState'

export const dynamic = 'force-dynamic'

export default async function StrategyAnalysisPage() {
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
    const profileId = effectiveUserId ? await getCurrentProfileId(effectiveUserId) : workosProfileId

    // Fetch all trades (exclude soft-deleted, filter by profile)
    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', effectiveUserId)
      .is('deleted_at', null)
    
    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data: trades, error } = await query.order('trade_date', { ascending: true })

    if (error) {
      // Handle table not existing gracefully
      if (error.code === 'PGRST205' || error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return <StrategyAnalysisClient trades={[]} />
      }
      throw error
    }

    return <StrategyAnalysisClient trades={trades || []} />
  } catch (error: any) {
    console.error('Strategy analysis page error:', error)
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <ErrorState 
          message={error.message || 'Failed to load strategy analysis data'}
          fullScreen={true}
        />
      </div>
    )
  }
}

