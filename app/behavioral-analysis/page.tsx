import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BehavioralAnalysisClient } from './BehavioralAnalysisClient'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { EmotionalCalculationEngine, TradeForEmotionalAnalysis } from '@/lib/emotional-engine/calculator'
import { analyzeTradingBehavior } from '@/lib/behavioral-analyzer'
import { detectPatterns } from '@/lib/ai-coach'

export default async function BehavioralAnalysisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get current profile
  const profileId = await getCurrentProfileId(user.id)

  // Fetch all trades (filter by profile)
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
  
  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }
  
  const { data: trades } = await tradesQuery.order('trade_date', { ascending: true })

  // Convert trades to format needed for emotional analysis
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

  // Calculate emotional state
  const emotionalState = tradesForAnalysis.length > 0
    ? EmotionalCalculationEngine.calculateEmotionalState(tradesForAnalysis)
    : null

  // Detect behavioral patterns
  const behavioralInsights = trades && trades.length > 0
    ? analyzeTradingBehavior(trades as any)
    : []

  // Detect patterns using AI coach
  const patterns = trades && trades.length > 0
    ? detectPatterns(trades as any)
    : []

  // Calculate discipline score from emotional state
  const disciplineScore = emotionalState?.discipline || 0

  // Serialize data to ensure no objects are passed that React can't render
  const serializedInsights = (behavioralInsights || []).map(insight => ({
    ...insight,
    data: insight.data ? JSON.parse(JSON.stringify(insight.data)) : undefined,
  }))

  const serializedPatterns = (patterns || []).map(pattern => ({
    ...pattern,
    metadata: pattern.metadata ? JSON.parse(JSON.stringify(pattern.metadata)) : undefined,
  }))

  return (
    <BehavioralAnalysisClient
      trades={trades || []}
      emotionalState={emotionalState}
      disciplineScore={disciplineScore}
      behavioralInsights={serializedInsights}
      patterns={serializedPatterns}
    />
  )
}
