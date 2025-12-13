import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'
import TradesPageClient from './TradesPageClient'

export default async function TradesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get current profile
  const profileId = await getCurrentProfileId(user.id)

  // fetch trades for this user (exclude soft-deleted, filter by profile)
  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
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
    .eq('user_id', user.id)
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
