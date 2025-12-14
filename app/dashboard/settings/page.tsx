import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './SettingsClient'
import { GeneralSettings } from './components/GeneralSettings'
import { NotificationSettings } from './components/NotificationSettings'
import { AiAutomationSettings } from './components/AiAutomationSettings'
import { DataPrivacySettings } from './components/DataPrivacySettings'
import { AccountBillingSettings } from './components/AccountBillingSettings'
import { AdvancedSettings } from './components/AdvancedSettings'
import { UsageStatsCard } from './components/UsageStatsCard'
import { PageLayout } from '@/components/layouts/PageLayout'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: stats } = await supabase
    .from('usage_stats')
    .select('*')
    .eq('user_id', user.id)
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
            <AiAutomationSettings />
            <DataPrivacySettings />
            <AccountBillingSettings />
            <AdvancedSettings />
          </div>
          <div className="lg:col-span-1">
            <UsageStatsCard />
          </div>
        </div>
      </SettingsClient>
    </PageLayout>
  )
}
