import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { WatchlistClient } from './WatchlistClient'
import { PageLayout } from '@/components/layouts/PageLayout'
import { cookies } from 'next/headers'

export default async function WatchlistPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  const workosUserId = cookieStore.get('workos_user_id')?.value
  
  if (authError || (!user && !workosUserId)) {
    redirect('/login')
  }

  const effectiveUserId = user?.id || workosUserId
  const profileId = await getCurrentProfileId(supabase, effectiveUserId)

  if (!profileId) {
    redirect('/dashboard')
  }

  // Get watchlists with items
  const { data: watchlists } = await supabase
    .from('watchlists')
    .select(`
      *,
      watchlist_items (
        *,
        order by order_index asc
      )
    `)
    .eq('user_id', effectiveUserId)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  return (
    <PageLayout
      title="Watchlist"
      subtitle="Track your favorite symbols"
      icon="eye"
    >
      <WatchlistClient initialWatchlists={watchlists || []} />
    </PageLayout>
  )
}

