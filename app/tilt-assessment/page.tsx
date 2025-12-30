import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { TiltAssessmentClient } from './TiltAssessmentClient'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { detectPatterns } from '@/lib/ai-coach'
import { EmotionalCalculationEngine, TradeForEmotionalAnalysis } from '@/lib/emotional-engine/calculator'

export default async function TiltAssessmentPage() {
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

  // Fetch all trades (filter by profile)
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', effectiveUserId)
    .is('deleted_at', null)
  
  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }
  
  const { data: trades } = await tradesQuery.order('trade_date', { ascending: true })

  // Convert trades for analysis
  const tradesForAnalysis: TradeForEmotionalAnalysis[] = (trades || []).map(t => ({
    id: t.id,
    entryTime: new Date(t.trade_date || t.created_at),
    exitTime: new Date(t.updated_at || t.trade_date || t.created_at),
    pnl: typeof t.pnl === 'string' ? parseFloat(t.pnl) : (t.pnl || 0),
    size: typeof t.quantity === 'string' ? parseFloat(t.quantity) : (t.quantity || 0),
    strategyType: t.strategy || 'Unknown',
    emotionalTags: t.tags || [],
    tags: t.tags || [],
  }))

  // Detect patterns
  let patterns: any[] = []
  try {
    patterns = trades && trades.length > 0
      ? detectPatterns(trades as any) || []
      : []
  } catch (error) {
    console.error('Error detecting patterns:', error)
    patterns = []
  }

  // Calculate emotional state for tilt score
  const emotionalState = tradesForAnalysis.length > 0
    ? EmotionalCalculationEngine.calculateEmotionalState(tradesForAnalysis)
    : null

  // Calculate tilt score (0-100, lower is better)
  // Based on revenge trading, overtrading, position sizing errors
  let tiltScore = 0
  if (emotionalState) {
    // Revenge trading contributes heavily
    const revenge = typeof emotionalState.revenge === 'number' ? emotionalState.revenge : 0
    tiltScore += revenge * 0.4
    
    // Overtrading
    const overtradingPattern = patterns.find(p => p.type === 'overtrading')
    if (overtradingPattern && typeof overtradingPattern.frequency === 'number') {
      tiltScore += Math.min(overtradingPattern.frequency * 5, 30)
    }
    
    // Position sizing errors (revenge sizing)
    const revengeSizingPattern = patterns.find(p => p.type === 'revenge_sizing')
    if (revengeSizingPattern && typeof revengeSizingPattern.frequency === 'number') {
      tiltScore += Math.min(revengeSizingPattern.frequency * 3, 20)
    }
    
    // Overconfidence
    const overconfidence = typeof emotionalState.overconfidence === 'number' ? emotionalState.overconfidence : 0
    tiltScore += overconfidence * 0.1
  }

  // Ensure tiltScore is a valid number
  tiltScore = isNaN(tiltScore) ? 0 : Math.min(100, Math.max(0, tiltScore))

  return (
    <TiltAssessmentClient
      trades={trades || []}
      tiltScore={Math.round(tiltScore)}
      patterns={patterns}
      emotionalState={emotionalState}
    />
  )
}
