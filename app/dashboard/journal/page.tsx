import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { JournalTable } from './components/JournalTable'
import { JournalFilters } from './components/JournalFilters'
import { SearchBar } from './components/SearchBar'
import { JournalTableSkeleton } from './components/JournalTableSkeleton'

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

  // Format P&L for display (in Lakhs)
  const formatPnL = (pnl: number) => {
    const lakhs = Math.abs(pnl) / 100000
    return `${pnl >= 0 ? '+' : '-'}₹${lakhs.toFixed(2)}L`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trading Journal</h1>
          <p className="text-gray-400 mt-1">
            Deep-dive into your execution quality and behavior.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-400">NET P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPnL(totalPnL)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-400">WIN RATE</p>
            <p className="text-2xl font-bold text-white">{winRate}%</p>
          </div>
        </div>
      </div>

      {/* Journal Progress */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white">Journal Progress</h3>
            <p className="text-sm text-gray-400">
              {journaledTrades} of {totalTrades} trades journaled
            </p>
          </div>
          <p className="text-3xl font-bold text-white">{journalPercentage}%</p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
            style={{ width: `${journalPercentage}%` }}
          />
        </div>
      </div>

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
    </div>
  )
}