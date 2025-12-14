import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { JournalTable } from './components/JournalTable'
import { JournalFilters } from './components/JournalFilters'
import { SearchBar } from './components/SearchBar'
import { JournalTableSkeleton } from './components/JournalTableSkeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartAnalysisSection } from './components/ChartAnalysisSection'
import { TrendingUp, BookOpen } from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Mic } from 'lucide-react'
import { formatINR } from '@/lib/formatters'

export const metadata = {
  title: 'Trading Journal | TradeAutopsy',
  description: 'Deep-dive into your execution quality and behavior',
}

interface SearchParams {
  filter?: string // 'all' | 'win' | 'loss'
  journaled?: string // 'all' | 'journaled' | 'not-journaled'
  search?: string
  page?: string
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const params = await searchParams
  const profileId = await getCurrentProfileId(user.id)

  // Fetch trades with pagination (only load 25 at a time instead of 2000+)
  const page = parseInt((params.page as string) || '1')
  const limit = 25
  const offset = (page - 1) * limit

  // For chart analysis, we need all trades (or at least a good sample)
  // Fetch a larger set for charts, but paginated for table
  const { data: allTradesForCharts } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('trade_date', { ascending: true })
    .limit(1000) // Limit to 1000 for performance

  let query = supabase
    .from('trades')
    .select('id, symbol, tradingsymbol, trade_date, trade_type, transaction_type, pnl, strategy, setup, execution_rating, notes, has_audio_journal', { count: 'exact' })
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('trade_date', { ascending: false })
    .range(offset, offset + limit - 1) // Only fetch current page

  // Filter by profile if available
  if (profileId) {
    query = query.eq('profile_id', profileId)
  }

  // Apply P&L filter
  const filter = params.filter || 'all'
  if (filter === 'win') {
    query = query.gt('pnl', 0)
  } else if (filter === 'loss') {
    query = query.lt('pnl', 0)
  }

  // Apply journaled filter
  const journaledFilter = params.journaled || 'all'
  if (journaledFilter === 'journaled') {
    // Trades with notes OR audio journal
    query = query.or('notes.not.is.null,has_audio_journal.eq.true')
  } else if (journaledFilter === 'not-journaled') {
    // Trades with no notes AND no audio journal
    query = query.is('notes', null)
    query = query.eq('has_audio_journal', false)
  }

  const { data: trades, error, count } = await query

  if (error) {
    console.error('Error fetching trades:', error)
  }

  // Calculate stats from aggregated query (much faster than fetching all rows)
  const { data: statsData } = await supabase
    .from('trades')
    .select('pnl, notes, has_audio_journal', { count: 'exact' })
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .limit(1000) // Sample for stats (faster than all)

  const totalTrades = statsData?.length || 0
  const journaledTrades = statsData?.filter((t: any) => t.notes || t.has_audio_journal).length || 0
  const journalPercentage = totalTrades > 0 ? Math.round((journaledTrades / totalTrades) * 100) : 0

  // Memoize expensive calculations
  const stats = {
    totalPnL: statsData?.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0) || 0,
    winningTrades: statsData?.filter((t: any) => (t.pnl || 0) > 0).length || 0,
  }
  
  const totalPnL = stats.totalPnL
  const winRate = totalTrades > 0 ? ((stats.winningTrades / totalTrades) * 100).toFixed(1) : '0.0'

  // Format P&L for display using formatter
  const formatPnL = (pnl: number) => {
    return formatINR(pnl, { compact: true })
  }

  return (
    <PageLayout
      title="Trading Journal"
      subtitle="Deep-dive into your execution quality and behavior."
      icon="bookOpen"
    >
      {/* Stats Cards */}
      <div className="grid-3">
        <StatCard
          label="NET P&L"
          value={formatPnL(totalPnL)}
          subtitle={`${stats.winningTrades} wins • ${totalTrades - stats.winningTrades} losses`}
          icon="trendingUp"
          iconColor={totalPnL >= 0 ? 'green' : 'red'}
          valueColor="auto"
          variant="darker"
        />
        <StatCard
          label="WIN RATE"
          value={`${winRate}%`}
          subtitle={`${stats.winningTrades} of ${totalTrades} trades`}
          icon="target"
          iconColor={parseFloat(winRate) >= 50 ? 'green' : 'red'}
          valueColor={parseFloat(winRate) >= 50 ? 'green' : 'red'}
          variant="darker"
        />
        <StatCard
          label="JOURNAL PROGRESS"
          value={`${journalPercentage}%`}
          subtitle={`${journaledTrades} of ${totalTrades} trades journaled`}
          icon="fileText"
          iconColor="blue"
          valueColor="white"
          variant="darker"
        />
      </div>

      {/* Journal Progress Card */}
      <Card variant="dark">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Journal Progress</h3>
            <p className="text-sm text-gray-400 mt-1">
              {journaledTrades} of {totalTrades} trades journaled
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Mic className="w-4 h-4 text-blue-400" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
            style={{ width: `${journalPercentage}%` }}
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="entries" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-lg">
          <TabsTrigger value="entries" className="data-[state=active]:bg-white/10">
            <BookOpen className="w-4 h-4 mr-2" />
            Journal Entries
          </TabsTrigger>
          <TabsTrigger value="charts" className="data-[state=active]:bg-white/10">
            <TrendingUp className="w-4 h-4 mr-2" />
            Chart Analysis
          </TabsTrigger>
        </TabsList>

        {/* Journal Entries Tab */}
        <TabsContent value="entries" className="space-y-6">
          {/* Search Bar */}
          <SearchBar initialValue={params.search} />

          {/* Filters */}
          <JournalFilters currentFilter={filter} currentJournaled={journaledFilter} />

          {/* Table */}
          <Suspense fallback={<JournalTableSkeleton />}>
            <JournalTable 
              trades={trades || []} 
              searchTerm={params.search}
              totalCount={count || 0}
              currentPage={page}
            />
          </Suspense>
        </TabsContent>

        {/* Chart Analysis Tab */}
        <TabsContent value="charts">
          <ChartAnalysisSection trades={allTradesForCharts || []} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}