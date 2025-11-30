import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Trade } from '@/types/trade'
import { calculateDashboardStats } from '@/lib/dashboard-stats'
import StatsCards from './components/StatsCards'
import MonthlyPnLChart from './components/MonthlyPnLChart'
import RecentTradesWidget from './components/RecentTradesWidget'
import QuickInsights from './components/QuickInsights'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: false })
    .returns<Trade[]>()

  const stats = calculateDashboardStats(trades || [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-zinc-400 mt-1">Track your trading performance at a glance</p>
      </div>

      <StatsCards
        thisWeek={stats.thisWeek}
        thisMonth={stats.thisMonth}
        allTime={stats.allTime}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyPnLChart data={stats.monthlyData} />
        <RecentTradesWidget trades={stats.recentTrades} />
      </div>

      <QuickInsights
        journaledCount={stats.journaledCount}
        totalCount={stats.totalCount}
      />
    </div>
  )
}
