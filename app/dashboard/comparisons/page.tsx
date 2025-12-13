import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import ComparisonsClient from './ComparisonsClient'
import { ErrorState } from '../components/ErrorState'

export const dynamic = 'force-dynamic'

export default async function ComparisonsPage() {
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
        return <ComparisonsClient trades={[]} />
      }
      throw error
    }

    return <ComparisonsClient trades={trades || []} />
  } catch (error: any) {
    console.error('Comparisons page error:', error)
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <ErrorState 
          message={error.message || 'Failed to load comparison data'}
          fullScreen={true}
        />
      </div>
    )
  }
}

