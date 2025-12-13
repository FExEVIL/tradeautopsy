import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generatePredictiveAlerts, storePredictiveAlerts } from '@/lib/predictive-alerts'

/**
 * Generate predictive alerts for the authenticated user
 * POST /api/alerts/generate
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate alerts
    const alerts = await generatePredictiveAlerts(user.id)

    if (alerts.length === 0) {
      return NextResponse.json({ generated: 0, message: 'No alerts to generate' })
    }

    // Check for duplicates (don't re-trigger same alert within 24 hours)
    const { data: recentAlerts, error: recentAlertsError } = await supabase
      .from('predictive_alerts')
      .select('alert_type')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // If table doesn't exist, skip duplicate check
    if (recentAlertsError && (recentAlertsError.code === 'PGRST205' || recentAlertsError.code === 'PGRST116')) {
      console.warn('predictive_alerts table does not exist yet')
    }

    const recentTypes = new Set(recentAlerts?.map(a => a.alert_type) || [])
    const newAlerts = alerts.filter(a => !recentTypes.has(a.type))

    if (newAlerts.length > 0) {
      await storePredictiveAlerts(user.id, newAlerts)
    }

    return NextResponse.json({
      generated: newAlerts.length,
      total: alerts.length,
      filtered: alerts.length - newAlerts.length,
      message: `Generated ${newAlerts.length} new alerts`
    })
  } catch (error: any) {
    console.error('Alert generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate alerts', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual trigger (for testing)
 */
export async function GET(request: NextRequest) {
  return POST(request)
}

