import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { cookies } from 'next/headers'
import TradesPageClient from './TradesPageClient'

export default async function TradesPage() {
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

  // fetch trades for this user (exclude soft-deleted, filter by profile)
  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', effectiveUserId)
    .is('deleted_at', null)
  
  if (profileId) {
    query = query.eq('profile_id', profileId)
  }

  const { data: trades, error: tradesError } = await query.order('trade_date', { ascending: true })

  if (tradesError) {
    console.error(tradesError)
    return null
  }

  // fetch last import log
  const { data: logs } = await supabase
    .from('import_logs')
    .select('*')
    .eq('user_id', effectiveUserId)
    .eq('source', 'zerodha_tradebook')
    .order('created_at', { ascending: false })
    .limit(1)

  const lastImport = logs?.[0] || null

  return (
    <TradesPageClient
      trades={trades || []}
      lastImport={
        lastImport
          ? {
              rows: lastImport.rows_imported,
              date: lastImport.created_at,
            }
          : null
      }
    />
  )
}
