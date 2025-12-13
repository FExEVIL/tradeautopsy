import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import BrokersClient from '../settings/brokers/BrokersClient'

export default async function BrokersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user's brokers
  const { data: brokers, error } = await supabase
    .from('brokers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching brokers:', error)
  }

  // Fetch profiles for broker-profile associations
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)

  return <BrokersClient initialBrokers={brokers || []} profiles={profiles || []} />
}
