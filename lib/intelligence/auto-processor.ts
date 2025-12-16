/**
 * Central processor for all auto-features (tagging, goals, mistakes)
 * This is called after trades are imported/created
 */

import { createClient } from '@/utils/supabase/server'
import { AutoTagger } from './auto-tagger'
import { AutoGoalSystem } from './auto-goals'
import { MistakeDetector } from './mistake-detector'
import { Trade } from './core/types'

export interface AutoProcessResult {
  tagsApplied: number
  mistakesDetected: number
  goalsGenerated: number
}

export async function processAutoFeatures(
  userId: string,
  profileId: string | null,
  newTradeIds: string[]
): Promise<AutoProcessResult> {
  console.log('🤖 [AutoProcessor] Processing auto-features for', newTradeIds.length, 'trades')
  
  const supabase = await createClient()
  let tagsApplied = 0
  let mistakesDetected = 0
  let goalsGenerated = 0

  try {
    // Fetch the new trades
    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .in('id', newTradeIds)

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data: newTrades, error: tradesError } = await query

    if (tradesError || !newTrades || newTrades.length === 0) {
      console.error('[AutoProcessor] Error fetching new trades:', tradesError)
      return { tagsApplied: 0, mistakesDetected: 0, goalsGenerated: 0 }
    }

    // Fetch previous trades for context
    let prevQuery = supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false })
      .limit(50)

    if (profileId) {
      prevQuery = prevQuery.eq('profile_id', profileId)
    }

    const { data: previousTrades } = await prevQuery

    // Process each new trade
    for (const tradeRow of newTrades) {
      // Convert database row to Trade type
      const trade: Trade = {
        id: tradeRow.id,
        user_id: tradeRow.user_id,
        profile_id: tradeRow.profile_id || '',
        symbol: tradeRow.symbol || tradeRow.tradingsymbol || 'UNKNOWN',
        side: (tradeRow.transaction_type?.toLowerCase().includes('buy') ? 'long' : 'short') as 'long' | 'short',
        entry_price: parseFloat(tradeRow.entry_price || tradeRow.average_price || '0'),
        exit_price: parseFloat(tradeRow.exit_price || tradeRow.average_price || '0'),
        quantity: parseFloat(tradeRow.quantity || '0'),
        pnl: parseFloat(tradeRow.pnl || '0'),
        pnl_percentage: parseFloat(tradeRow.pnl_percentage || '0'),
        gross_pnl: parseFloat(tradeRow.pnl || '0'),
        commission: parseFloat(tradeRow.charges || '0'),
        entry_time: tradeRow.entry_time || tradeRow.trade_date || tradeRow.created_at,
        exit_time: tradeRow.exit_time || tradeRow.trade_date || tradeRow.updated_at,
        duration_minutes: tradeRow.duration_minutes || 0,
        strategy: tradeRow.strategy || undefined,
        setup: tradeRow.setup_type || tradeRow.setup || undefined,
        timeframe: tradeRow.timeframe || undefined,
        stop_loss: tradeRow.stop_loss ? parseFloat(tradeRow.stop_loss) : undefined,
        target: tradeRow.target || tradeRow.take_profit ? parseFloat(tradeRow.target || tradeRow.take_profit) : undefined,
        notes: tradeRow.notes || undefined,
        tags: tradeRow.tags || [],
        created_at: tradeRow.created_at,
        updated_at: tradeRow.updated_at,
      }

      // 1. Auto-tagging
      try {
        const tags = await AutoTagger.generateTags(trade, previousTrades || [])
        if (tags.length > 0) {
          const tagValues = tags.map(t => `${t.category}:${t.value}`)
          const existingTags = trade.tags || []
          const allTags = [...new Set([...existingTags, ...tagValues])]

          await supabase
            .from('trades')
            .update({ tags: allTags })
            .eq('id', trade.id)

          tagsApplied += tags.length
          console.log(`🏷️ [AutoProcessor] Applied ${tags.length} tags to trade ${trade.id}`)
        }
      } catch (error) {
        console.error('❌ [AutoProcessor] Error tagging trade:', error)
      }

      // 2. Auto-mistake detection
      try {
        const mistakes = await MistakeDetector.detectMistakes(trade, previousTrades || [])
        if (mistakes.length > 0) {
          console.log(`🔍 [AutoProcessor] Detected ${mistakes.length} mistakes for trade ${trade.id}:`, mistakes.map(m => m.type))
          
          // Insert mistakes into database
          const mistakesToInsert = mistakes.map(m => ({
            user_id: m.user_id,
            profile_id: profileId,
            trade_id: m.trade_id,
            mistake_type: m.type,
            description: m.description,
            severity: m.severity,
            detected_at: m.detected_at,
            is_resolved: false,
          }))

          const { error: insertError } = await supabase.from('mistakes').insert(mistakesToInsert)
          if (insertError) {
            console.error('❌ [AutoProcessor] Error inserting mistakes:', insertError)
          } else {
            mistakesDetected += mistakes.length
            console.log(`✅ [AutoProcessor] Saved ${mistakes.length} mistakes to database`)
          }
        }
      } catch (error) {
        console.error('❌ [AutoProcessor] Error detecting mistakes:', error)
      }
    }

    // 3. Auto-goal generation (once per batch, not per trade)
    try {
      // Fetch all user trades for goal generation
      let allTradesQuery = supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('trade_date', { ascending: true })

      if (profileId) {
        allTradesQuery = allTradesQuery.eq('profile_id', profileId)
      }

      const { data: allTrades } = await allTradesQuery

      if (allTrades && allTrades.length > 0) {
        // Convert to Trade type
        const trades: Trade[] = allTrades.map(t => ({
          id: t.id,
          user_id: t.user_id,
          profile_id: t.profile_id || '',
          symbol: t.symbol || t.tradingsymbol || 'UNKNOWN',
          side: (t.transaction_type?.toLowerCase().includes('buy') ? 'long' : 'short') as 'long' | 'short',
          entry_price: parseFloat(t.entry_price || t.average_price || '0'),
          exit_price: parseFloat(t.exit_price || t.average_price || '0'),
          quantity: parseFloat(t.quantity || '0'),
          pnl: parseFloat(t.pnl || '0'),
          pnl_percentage: parseFloat(t.pnl_percentage || '0'),
          gross_pnl: parseFloat(t.pnl || '0'),
          commission: parseFloat(t.charges || '0'),
          entry_time: t.entry_time || t.trade_date || t.created_at,
          exit_time: t.exit_time || t.trade_date || t.updated_at,
          duration_minutes: t.duration_minutes || 0,
          created_at: t.created_at,
          updated_at: t.updated_at,
        }))

        // Check if goals already exist
        const { data: existingGoals } = await supabase
          .from('goals')
          .select('id')
          .eq('user_id', userId)
          .eq('completed', false)

        // Only generate goals if none exist or very few
        if (!existingGoals || existingGoals.length < 2) {
          const goals = await AutoGoalSystem.generateGoals(trades, userId)

          if (goals.length > 0) {
            console.log(`🎯 [AutoProcessor] Generated ${goals.length} goals:`, goals.map(g => g.title))
            
            // Map to database schema
            const goalsToInsert = goals.map(g => ({
              user_id: g.user_id,
              goal_type: g.type,
              title: g.title,
              target_value: g.target,
              current_value: g.current,
              deadline: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : null,
              completed: g.status === 'completed',
            }))

            const { error: insertError } = await supabase.from('goals').insert(goalsToInsert)
            if (insertError) {
              console.error('❌ [AutoProcessor] Error inserting goals:', insertError)
            } else {
              goalsGenerated = goals.length
              console.log(`✅ [AutoProcessor] Saved ${goals.length} goals to database`)
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [AutoProcessor] Error generating goals:', error)
    }

    console.log('✅ [AutoProcessor] Complete:', {
      tagsApplied,
      mistakesDetected,
      goalsGenerated,
    })

    return { tagsApplied, mistakesDetected, goalsGenerated }
  } catch (error) {
    console.error('❌ [AutoProcessor] Error processing auto-features:', error)
    return { tagsApplied, mistakesDetected, goalsGenerated }
  }
}
