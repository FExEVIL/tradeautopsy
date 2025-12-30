import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import EconomicCalendarClient from './EconomicCalendarClient'

export default async function EconomicCalendarPage() {
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

  // Fetch economic events (last 7 days and next 14 days)
  const today = new Date()
  const fromDate = new Date()
  fromDate.setDate(today.getDate() - 7)
  const toDate = new Date()
  toDate.setDate(today.getDate() + 14)

  const { data: events, error } = await supabase
    .from('economic_events')
    .select('*')
    .gte('event_date', fromDate.toISOString().split('T')[0])
    .lte('event_date', toDate.toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .order('impact', { ascending: false })

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching economic events:', error)
  }

  return <EconomicCalendarClient events={events || []} />
}
