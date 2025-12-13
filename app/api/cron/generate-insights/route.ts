import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { analyzeRecentTrades, storeAIInsights, storeDetectedPatterns } from '@/lib/ai-coach'
import { generatePredictiveAlerts, storePredictiveAlerts } from '@/lib/predictive-alerts'

/**
 * Background job to generate AI insights for all users
 * Should be called via cron job (e.g., Vercel Cron or external service)
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Get all users with trades
  const { data: users } = await supabase
    .from('trades')
    .select('user_id')
    .not('user_id', 'is', null)

  if (!users || users.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No users found' })
  }

  // Get unique user IDs
  const uniqueUserIds = Array.from(new Set(users.map(u => u.user_id)))

  let processed = 0
  let errors = 0

  for (const userId of uniqueUserIds) {
    try {
      // Check if user already has recent insights (within last 24 hours)
      const { data: recentInsights, error: insightsCheckError } = await supabase
        .from('ai_insights')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1)

      // If table doesn't exist, skip cache check
      if (insightsCheckError && (insightsCheckError.code === 'PGRST205' || insightsCheckError.code === 'PGRST116')) {
        console.warn(`ai_insights table does not exist for user ${userId}`)
      }

      // Skip if user has recent insights (cache for 24 hours)
      if (recentInsights && recentInsights.length > 0) {
        continue
      }

      // Analyze trades and generate insights
      const insights = await analyzeRecentTrades(userId)

      if (insights && insights.length > 0) {
        // Store insights
        await storeAIInsights(userId, insights)

        // Detect and store patterns
        const { data: trades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', userId)
          .order('trade_date', { ascending: false })
          .limit(30)

        if (trades && trades.length >= 5) {
          const { detectPatterns } = await import('@/lib/ai-coach')
          const patterns = detectPatterns(trades as any)
          if (patterns && patterns.length > 0) {
            await storeDetectedPatterns(userId, patterns)
          }

          // Generate predictive alerts
          try {
            const predictiveAlerts = await generatePredictiveAlerts(userId)
            if (predictiveAlerts && predictiveAlerts.length > 0) {
              // Check for duplicates (same alert type within 24 hours)
              const { data: recentAlerts, error: alertsCheckError } = await supabase
                .from('predictive_alerts')
                .select('alert_type')
                .eq('user_id', userId)
                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

              // If table doesn't exist, skip duplicate check
              if (alertsCheckError && (alertsCheckError.code === 'PGRST205' || alertsCheckError.code === 'PGRST116')) {
                console.warn(`predictive_alerts table does not exist for user ${userId}`)
              }

              const recentTypes = new Set(recentAlerts?.map(a => a.alert_type) || [])
              const newAlerts = predictiveAlerts.filter(a => !recentTypes.has(a.type))

              if (newAlerts.length > 0) {
                await storePredictiveAlerts(userId, newAlerts)
              }
            }
          } catch (alertError) {
            console.error(`Error generating predictive alerts for user ${userId}:`, alertError)
            // Don't fail the whole job if alerts fail
          }
        }

        processed++
      }
    } catch (error) {
      console.error(`Error processing user ${userId}:`, error)
      errors++
    }
  }

  return NextResponse.json({
    processed,
    errors,
    total: uniqueUserIds.length,
    message: `Processed ${processed} users, ${errors} errors`
  })
}

