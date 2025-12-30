import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import TiltClient from './TiltClient'

export default async function TiltPage() {
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

  // --- TILT ALGORITHM ---
  const processedTrades = (trades || []).map(t => ({
    ...t,
    pnl: parseFloat(t.pnl || 0),
    date: t.trade_date ? new Date(t.trade_date) : new Date()
  }))

  let currentStreak = 0
  let maxLosingStreak = 0
  let rapidFireCount = 0
  let revengeTradeCount = 0
  let recentLosses = 0
  
  // Sort by time for gap analysis
  const sortedTrades = [...processedTrades].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Analyze last 20 trades for "Current State"
  const recentTrades = sortedTrades.slice(-20)
  
  recentTrades.forEach((t, i) => {
    // Streak Logic
    if (t.pnl < 0) {
      currentStreak++
      recentLosses++
    } else {
      currentStreak = 0
    }
    if (currentStreak > maxLosingStreak) maxLosingStreak = currentStreak

    // Rapid Fire / Revenge Logic (Gap < 15 mins from previous trade)
    if (i > 0) {
      const timeDiff = (t.date.getTime() - recentTrades[i-1].date.getTime()) / (1000 * 60) // mins
      if (timeDiff < 15) {
        rapidFireCount++
        // If previous was loss, it's likely revenge
        if (recentTrades[i-1].pnl < 0) revengeTradeCount++
      }
    }
  })

  // Calculate Tilt Score (0-100)
  let tiltScore = 0
  const last5 = recentTrades.slice(-5)
  const last5Losses = last5.filter(t => t.pnl < 0).length
  
  tiltScore += (last5Losses * 10)
  tiltScore += (revengeTradeCount * 15)
  tiltScore += (rapidFireCount * 5)

  if (tiltScore > 100) tiltScore = 100

  const tiltMetrics = {
    score: tiltScore,
    streak: currentStreak,
    revengeCount: revengeTradeCount,
    rapidFire: rapidFireCount,
    recentLossCount: last5Losses
  }

  return <TiltClient tiltMetrics={tiltMetrics} />
}
