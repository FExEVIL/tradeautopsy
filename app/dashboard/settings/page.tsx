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
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Customize your TradeAutopsy experience</p>
        </div>

        <SettingsClient 
          initialPreferences={preferences || {}}
          initialStats={stats || {}}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
    </div>
  )
}
