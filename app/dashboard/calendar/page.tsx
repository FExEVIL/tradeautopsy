import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import CalendarClient from './CalendarClient'
import { PageLayout } from '@/components/layouts/PageLayout'
import { getCalendarData } from '@/lib/queries/optimized'

export default async function CalendarPage() {
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
  
  // Use effective user ID for queries
  const effectiveUserId = user?.id || workosProfileId
  const profileId = effectiveUserId ? await getCurrentProfileId(effectiveUserId) : workosProfileId

  // ✅ Use optimized query function for current month
  const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  
  const dailyData = await getCalendarData(
    supabase,
    effectiveUserId,
    startDate,
    endDate,
    profileId
  )

  return (
    <PageLayout
      title="Trading Calendar"
      subtitle="Track your trading activity and performance over time. Click on any date to see detailed performance."
      icon="calendar"
    >
      <Suspense fallback={<div className="h-96 bg-gray-900 rounded-lg animate-pulse" />}>
        <CalendarClient dailyData={dailyData} />
      </Suspense>
    </PageLayout>
  )
}