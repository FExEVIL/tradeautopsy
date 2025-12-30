import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { TradeDetailClient } from './TradeDetailClient'

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const { id } = await params

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

  const { data: trade } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)
    .eq('user_id', effectiveUserId)
    .single()

  if (!trade) redirect('/dashboard/trades')

  // Fetch audio journal if exists
  const { data: audioJournal } = await supabase
    .from('audio_journal_entries')
    .select('*')
    .eq('trade_id', id)
    .eq('user_id', effectiveUserId)
    .maybeSingle()

  return <TradeDetailClient trade={trade} audioJournal={audioJournal || null} />
}
