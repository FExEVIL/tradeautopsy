import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MLInsightsClient from './MLInsightsClient'

export default async function MLInsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch ML insights
  const { data: insights, error } = await supabase
    .from('ml_insights')
    .select('*')
    .eq('user_id', user.id)
    .eq('acknowledged', false)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching ML insights:', error)
  }

  return <MLInsightsClient initialInsights={insights || []} />
}
