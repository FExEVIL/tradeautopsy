// Server-only utility functions (uses server Supabase client)
import { createClient } from '@/utils/supabase/server'
import { isJournaled } from './journal-utils'

export async function getJournalProgress(userId: string, profileId?: string | null) {
  const supabase = await createClient()
  
  let query = supabase
    .from('trades')
    .select('id, notes, execution_rating, setup, mistakes, screenshot_url', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null) // Exclude soft-deleted trades

  // Filter by profile if provided
  if (profileId) {
    query = query.eq('profile_id', profileId)
  }

  const { data: trades, error, count } = await query

  if (error) {
    console.error('Journal progress error:', error)
    return { journaled: 0, total: 0, percentage: 0 }
  }

  // Use count if available (more efficient), otherwise use trades array length
  const total = count ?? (trades?.length || 0)
  const journaled = trades ? trades.filter(isJournaled).length : 0

  return {
    journaled,
    total,
    percentage: total > 0 ? Math.round((journaled / total) * 100) : 0,
  }
}

