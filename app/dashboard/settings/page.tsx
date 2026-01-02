import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { SettingsClient } from './SettingsClient'
import { GeneralSettings } from './components/GeneralSettings'
import { NotificationSettings } from './components/NotificationSettings'
import { AiAutomationSettings } from './components/AiAutomationSettings'
import { DataPrivacySettings } from './components/DataPrivacySettings'
import { AccountBillingSettings } from './components/AccountBillingSettings'
import { BrowserExtensionSettings } from './components/BrowserExtensionSettings'
import { AdvancedSettings } from './components/AdvancedSettings'
import { DangerZone } from './components/DangerZone'
import { UsageStatsCard } from './components/UsageStatsCard'
import { PageLayout } from '@/components/layouts/PageLayout'

export default async function SettingsPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  // Check Supabase auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // Check WorkOS auth (fallback)
  const workosUserId = cookieStore.get('workos_user_id')?.value
  const workosProfileId = cookieStore.get('workos_profile_id')?.value || cookieStore.get('active_profile_id')?.value
  
  // Must have either Supabase user OR WorkOS session
  if ((authError || !user) && !workosUserId) {
    redirect('/login')
  }
  
  // Use effective user ID for queries
  const effectiveUserId = user?.id || workosProfileId

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', effectiveUserId)
    .maybeSingle()

  const { data: stats } = await supabase
    .from('usage_stats')
    .select('*')
    .eq('user_id', effectiveUserId)
    .maybeSingle()

  return (
    <PageLayout
      title="Settings"
      subtitle="Customize your TradeAutopsy experience"
      icon="settings"
    >
      <SettingsClient 
        initialPreferences={preferences || {}}
        initialStats={stats || {}}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-6">
            <GeneralSettings />
            <NotificationSettings />
            <BrowserExtensionSettings />
            <AiAutomationSettings />
            <DataPrivacySettings />
            <AccountBillingSettings />
            <AdvancedSettings />
            <DangerZone />
          </div>
          <div className="lg:col-span-1">
            <UsageStatsCard />
          </div>
        </div>
      </SettingsClient>
    </PageLayout>
  )
}
