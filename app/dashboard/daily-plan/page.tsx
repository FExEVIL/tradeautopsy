import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import DailyPlanClient from './DailyPlanClient'

export default async function DailyPlanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const profileId = await getCurrentProfileId()

  // Fetch today's plan if it exists
  const today = new Date().toISOString().split('T')[0]
  const { data: todayPlan } = await supabase
    .from('daily_trade_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('plan_date', today)
    .eq('profile_id', profileId)
    .single()

  // Fetch recent plans for reference
  const { data: recentPlans } = await supabase
    .from('daily_trade_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('profile_id', profileId)
    .order('plan_date', { ascending: false })
    .limit(7)

  return (
    <DailyPlanClient 
      initialPlan={todayPlan || null}
      recentPlans={recentPlans || []}
      profileId={profileId}
    />
  )
}

