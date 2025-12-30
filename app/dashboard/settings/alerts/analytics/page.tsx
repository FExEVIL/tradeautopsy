import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AlertAnalyticsClient } from './AlertAnalyticsClient'

export default async function AlertAnalyticsPage() {
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

  // Fetch alert effectiveness stats
  const { data: stats, error } = await supabase
    .from('predictive_alerts')
    .select('alert_type, user_action, helpful, confidence, created_at')
    .eq('user_id', effectiveUserId)

  if (error && (error.code === 'PGRST205' || error.code === 'PGRST116')) {
    // Table doesn't exist yet
    return <AlertAnalyticsClient stats={[]} />
  }

  // Calculate stats
  const alertStats = (stats || []).reduce((acc: any, alert: any) => {
    if (!acc[alert.alert_type]) {
      acc[alert.alert_type] = {
        alert_type: alert.alert_type,
        total: 0,
        heeded: 0,
        helpful: 0,
        not_helpful: 0,
        dismissed: 0,
        total_confidence: 0
      }
    }
    
    acc[alert.alert_type].total++
    if (alert.user_action === 'heeded') acc[alert.alert_type].heeded++
    if (alert.helpful === true) acc[alert.alert_type].helpful++
    if (alert.helpful === false) acc[alert.alert_type].not_helpful++
    if (alert.user_action === 'dismissed') acc[alert.alert_type].dismissed++
    if (alert.confidence) acc[alert.alert_type].total_confidence += alert.confidence
    
    return acc
  }, {})

  const statsArray = Object.values(alertStats).map((stat: any) => ({
    ...stat,
    heeded_rate: stat.total > 0 ? (stat.heeded / stat.total) * 100 : 0,
    helpful_rate: (stat.helpful + stat.not_helpful) > 0 
      ? (stat.helpful / (stat.helpful + stat.not_helpful)) * 100 
      : 0,
    avg_confidence: stat.total > 0 ? stat.total_confidence / stat.total : 0
  }))

  return <AlertAnalyticsClient stats={statsArray} />
}
