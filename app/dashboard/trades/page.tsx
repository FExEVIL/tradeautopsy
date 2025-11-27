import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import TradesPageClient from './TradesPageClient'

export default async function TradesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: false })

  return <TradesPageClient trades={trades || []} />
}
