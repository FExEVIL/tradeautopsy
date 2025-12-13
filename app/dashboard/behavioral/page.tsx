import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { analyzeTradingBehavior } from '@/lib/behavioral-analyzer'
import BehavioralClient from './BehavioralClient'

export default async function BehavioralPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: true })

  // Ensure trades is an array
  const safeTrades = trades || []
  
  // Generate insights, defaulting to empty array if analyzer returns null/undefined
  const insights = analyzeTradingBehavior(safeTrades) || []

  return <BehavioralClient insights={insights} trades={safeTrades} />
}
