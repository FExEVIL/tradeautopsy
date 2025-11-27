import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { TradeDetailClient } from './TradeDetailClient'

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params  // Add this line

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trade } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)  // Change params.id to just id
    .eq('user_id', user.id)
    .single()

  if (!trade) redirect('/dashboard/trades')

  return <TradeDetailClient trade={trade} />
}
