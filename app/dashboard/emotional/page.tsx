import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import EmotionalClient from './EmotionalClient'

export default async function EmotionalPage() {
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

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', effectiveUserId)
    .order('trade_date', { ascending: true })

  const safeTrades = (trades || []).map((t) => ({
    ...t,
    pnl: parseFloat(t.pnl || 0),
    emotion: t.emotion || 'Neutral',
    sleep_score: t.sleep_score || 3,
    focus_score: t.focus_score || 3,
  }))

  const emotionStats: Record<string, { wins: number; total: number; pnl: number }> = {}

  safeTrades.forEach((t) => {
    const emo = t.emotion as string
    if (!emotionStats[emo]) emotionStats[emo] = { wins: 0, total: 0, pnl: 0 }
    emotionStats[emo].total += 1
    emotionStats[emo].pnl += t.pnl
    if (t.pnl > 0) emotionStats[emo].wins += 1
  })

  const emotionCorrelation = Object.entries(emotionStats).map(([emotion, stats]) => ({
    emotion,
    winRate: (stats.wins / stats.total) * 100,
    avgPnL: stats.pnl / stats.total,
    count: stats.total,
  }))

  const sleepStats: Record<number, { pnl: number; count: number }> = {
    1: { pnl: 0, count: 0 },
    2: { pnl: 0, count: 0 },
    3: { pnl: 0, count: 0 },
    4: { pnl: 0, count: 0 },
    5: { pnl: 0, count: 0 },
  }

  safeTrades.forEach((t) => {
    const score = Math.min(5, Math.max(1, Math.round(t.sleep_score as number)))
    sleepStats[score].pnl += t.pnl
    sleepStats[score].count += 1
  })

  const sleepCorrelation = Object.entries(sleepStats).map(([score, stats]) => ({
    score: parseInt(score, 10),
    avgPnL: stats.count > 0 ? stats.pnl / stats.count : 0,
    count: stats.count,
  }))

  return <EmotionalClient emotionCorrelation={emotionCorrelation} sleepCorrelation={sleepCorrelation} />
}
