import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { TradeDetailClient } from './TradeDetailClient'

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params  // Add this line

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trade } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!trade) redirect('/dashboard/trades')

  // Fetch audio journal if exists
  const { data: audioJournal } = await supabase
    .from('audio_journal_entries')
    .select('*')
    .eq('trade_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  return <TradeDetailClient trade={trade} audioJournal={audioJournal || null} />
}
