import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import CalendarClient from './CalendarClient'
import { PageLayout } from '@/components/layouts/PageLayout'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profileId = await getCurrentProfileId(user.id)

  // Fetch all trades for calendar with profile filter
  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('trade_date', { ascending: true })

  if (profileId) {
    query = query.eq('profile_id', profileId)
  }

  const { data: trades } = await query

  // Process trades into daily P&L map
  const dailyData: { [date: string]: { pnl: number; trades: any[]; count: number } } = {}

  ;(trades || []).forEach(t => {
    const dateKey = t.trade_date ? new Date(t.trade_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    const pnl = parseFloat(t.pnl || 0)

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { pnl: 0, trades: [], count: 0 }
    }

    dailyData[dateKey].pnl += pnl
    dailyData[dateKey].trades.push(t)
    dailyData[dateKey].count++
  })

  return (
    <PageLayout
      title="Trading Calendar"
      subtitle="Track your trading activity and performance over time. Click on any date to see detailed performance."
      icon="calendar"
    >
      <CalendarClient dailyData={dailyData} />
    </PageLayout>
  )
}