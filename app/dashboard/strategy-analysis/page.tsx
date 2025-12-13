import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import StrategyAnalysisClient from './StrategyAnalysisClient'
import { ErrorState } from '../components/ErrorState'

export const dynamic = 'force-dynamic'

export default async function StrategyAnalysisPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Get current profile
    const profileId = await getCurrentProfileId(user.id)

    // Fetch all trades (exclude soft-deleted, filter by profile)
    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
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

