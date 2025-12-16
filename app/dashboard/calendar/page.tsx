import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { Suspense } from 'react'
import { DynamicCalendar } from '@/lib/dynamicImports'
import { PageLayout } from '@/components/layouts/PageLayout'
import { getCalendarData } from '@/lib/queries/optimized'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profileId = await getCurrentProfileId(user.id)

  // ✅ Use optimized query function for current month
  const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  
  const dailyData = await getCalendarData(
    supabase,
    user.id,
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
        <DynamicCalendar dailyData={dailyData} />
      </Suspense>
    </PageLayout>
  )
}