import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Trade } from '@/types/trade'
import CalendarClient from './CalendarClient'

export default async function CalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: true })
    .returns<Trade[]>()

  return <CalendarClient trades={trades || []} />
}
