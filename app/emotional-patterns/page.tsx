import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EmotionalPatternsClient } from './EmotionalPatternsClient'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { EmotionalCalculationEngine, TradeForEmotionalAnalysis } from '@/lib/emotional-engine/calculator'

export default async function EmotionalPatternsPage() {
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
  let tradesForAnalysis: TradeForEmotionalAnalysis[] = []
  try {
    tradesForAnalysis = (trades || []).map(t => ({
      id: t.id || `trade-${Date.now()}-${Math.random()}`,
      entryTime: new Date(t.trade_date || t.created_at || Date.now()),
      exitTime: new Date(t.updated_at || t.trade_date || t.created_at || Date.now()),
      pnl: typeof t.pnl === 'string' ? parseFloat(t.pnl) : (t.pnl || 0),
      size: typeof t.quantity === 'string' ? parseFloat(t.quantity) : (t.quantity || 0),
      strategyType: t.strategy || 'Unknown',
      emotionalTags: Array.isArray(t.tags) ? t.tags : [],
      tags: Array.isArray(t.tags) ? t.tags : [],
    }))
  } catch (error) {
    console.error('Error converting trades for analysis:', error)
    tradesForAnalysis = []
  }

  // Calculate emotional state with comprehensive error handling
  // Default fallback state
  const defaultEmotionalState = {
    overall: 50,
    confidence: 50,
    discipline: 50,
    patience: 50,
    emotionalControl: 50,
    riskAwareness: 50,
    fear: 0,
    greed: 0,
    revenge: 0,
    overconfidence: 0,
    status: 'neutral' as const,
    recommendation: 'Not enough data to analyze emotional state.',
    insights: [] as string[],
  }

  let emotionalState: typeof defaultEmotionalState | null = null
  
  try {
    // Validate EmotionalCalculationEngine exists and has the method
    if (!EmotionalCalculationEngine) {
      console.warn('EmotionalCalculationEngine is not available, using default state')
      emotionalState = defaultEmotionalState
    } else if (typeof EmotionalCalculationEngine.calculateEmotionalState !== 'function') {
      console.warn('calculateEmotionalState is not a function, using default state')
      emotionalState = defaultEmotionalState
    } else if (tradesForAnalysis.length === 0) {
      // No trades, use default state
      emotionalState = defaultEmotionalState
    } else {
      // Try to calculate emotional state with additional safety
      try {
        // Ensure tradesForAnalysis is valid
        if (!Array.isArray(tradesForAnalysis) || tradesForAnalysis.length === 0) {
          emotionalState = defaultEmotionalState
        } else {
          // Validate all trades have required fields
          const validTrades = tradesForAnalysis.filter(t => 
            t && 
            t.id && 
            t.entryTime instanceof Date && 
            typeof t.pnl === 'number'
          )
          
          if (validTrades.length === 0) {
            emotionalState = defaultEmotionalState
          } else {
            // Call with valid trades only
            const result = EmotionalCalculationEngine.calculateEmotionalState(validTrades)
            
            // Validate result structure
            if (
              result &&
              typeof result === 'object' &&
              typeof result.overall === 'number' &&
              typeof result.confidence === 'number' &&
              Array.isArray(result.insights)
            ) {
              emotionalState = result
            } else {
              console.warn('Invalid emotional state structure, using default')
              emotionalState = defaultEmotionalState
            }
          }
        }
      } catch (calcError: any) {
        console.error('Error in calculateEmotionalState:', calcError)
        console.error('Error details:', {
          message: calcError?.message,
          stack: calcError?.stack,
          name: calcError?.name,
          tradesCount: tradesForAnalysis.length,
        })
        emotionalState = defaultEmotionalState
      }
    }
  } catch (error: any) {
    console.error('Error in emotional state calculation block:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    emotionalState = defaultEmotionalState
  }
  
  // Ensure we always have a valid state
  if (!emotionalState) {
    emotionalState = defaultEmotionalState
  }

  // Fetch emotional journal entries if table exists
  let emotionEntries: any[] = []
  try {
    const { data, error } = await supabase
      .from('audio_journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (!error && data) {
      emotionEntries = data
    }
  } catch (error) {
    // Table might not exist, use empty array
    console.warn('Could not fetch emotion entries:', error)
    emotionEntries = []
  }

  // Final validation - ensure emotionalState is never null and all values are valid numbers
  const finalEmotionalState = emotionalState || defaultEmotionalState
  
  // Sanitize all numeric values to ensure they're valid (not NaN or Infinity)
  const sanitizedEmotionalState = {
    ...finalEmotionalState,
    overall: isNaN(finalEmotionalState.overall) || !isFinite(finalEmotionalState.overall) ? 50 : Math.max(0, Math.min(100, finalEmotionalState.overall)),
    confidence: isNaN(finalEmotionalState.confidence) || !isFinite(finalEmotionalState.confidence) ? 50 : Math.max(0, Math.min(100, finalEmotionalState.confidence)),
    discipline: isNaN(finalEmotionalState.discipline) || !isFinite(finalEmotionalState.discipline) ? 50 : Math.max(0, Math.min(100, finalEmotionalState.discipline)),
    patience: isNaN(finalEmotionalState.patience) || !isFinite(finalEmotionalState.patience) ? 50 : Math.max(0, Math.min(100, finalEmotionalState.patience)),
    emotionalControl: isNaN(finalEmotionalState.emotionalControl) || !isFinite(finalEmotionalState.emotionalControl) ? 50 : Math.max(0, Math.min(100, finalEmotionalState.emotionalControl)),
    riskAwareness: isNaN(finalEmotionalState.riskAwareness) || !isFinite(finalEmotionalState.riskAwareness) ? 50 : Math.max(0, Math.min(100, finalEmotionalState.riskAwareness)),
    fear: isNaN(finalEmotionalState.fear) || !isFinite(finalEmotionalState.fear) ? 0 : Math.max(0, Math.min(100, finalEmotionalState.fear)),
    greed: isNaN(finalEmotionalState.greed) || !isFinite(finalEmotionalState.greed) ? 0 : Math.max(0, Math.min(100, finalEmotionalState.greed)),
    revenge: isNaN(finalEmotionalState.revenge) || !isFinite(finalEmotionalState.revenge) ? 0 : Math.max(0, Math.min(100, finalEmotionalState.revenge)),
    overconfidence: isNaN(finalEmotionalState.overconfidence) || !isFinite(finalEmotionalState.overconfidence) ? 0 : Math.max(0, Math.min(100, finalEmotionalState.overconfidence)),
    insights: Array.isArray(finalEmotionalState.insights) ? finalEmotionalState.insights : [],
  }

  return (
    <EmotionalPatternsClient
      trades={trades || []}
      emotionalState={sanitizedEmotionalState}
      emotionEntries={emotionEntries}
    />
  )
}
