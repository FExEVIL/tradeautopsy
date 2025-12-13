'use client'

import { useState } from 'react'
import { Settings, Zap, Tag, Target, Brain, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface AutomationPreferences {
  user_id: string
  auto_tag_enabled: boolean
  auto_categorize_enabled: boolean
  auto_pattern_detection: boolean
  auto_report_schedule: string | null
  smart_suggestions_enabled: boolean
  updated_at: string
}

interface AutomationSettingsClientProps {
  initialPreferences: AutomationPreferences | null
}

export default function AutomationSettingsClient({ initialPreferences }: AutomationSettingsClientProps) {
  const [preferences, setPreferences] = useState<AutomationPreferences>(initialPreferences || {
    user_id: '',
    auto_tag_enabled: true,
    auto_categorize_enabled: true,
    auto_pattern_detection: true,
    auto_report_schedule: 'off',
    smart_suggestions_enabled: true,
    updated_at: new Date().toISOString()
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('automation_preferences')
        .upsert({
          ...preferences,
          user_id: user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        // If table doesn't exist, log warning but don't crash
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('automation_preferences table does not exist yet')
          alert('Automation preferences table not found. Please run the database migration first.')
        } else {
          throw error
        }
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const ToggleCard = ({ 
    title, 
    description, 
    icon: Icon, 
    enabled, 
    onChange 
  }: { 
    title: string
    description: string
    icon: typeof Zap
    enabled: boolean
    onChange: (enabled: boolean) => void
  }) => (
    <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-400" />
            Automation Settings
          </h1>
          <p className="text-gray-400 mt-2">Configure automatic tagging, categorization, and pattern detection</p>
        </div>

        <div className="space-y-4">
          <ToggleCard
            title="Auto-Tag Trades"
            description="Automatically tag trades based on outcome, time, symbol, and strategy"
            icon={Tag}
            enabled={preferences.auto_tag_enabled}
            onChange={(enabled) => setPreferences({ ...preferences, auto_tag_enabled: enabled })}
          />

          <ToggleCard
            title="Auto-Categorize Strategies"
            description="Automatically detect and assign strategy type (Intraday, Swing, Options, etc.)"
            icon={Target}
            enabled={preferences.auto_categorize_enabled}
            onChange={(enabled) => setPreferences({ ...preferences, auto_categorize_enabled: enabled })}
          />

          <ToggleCard
            title="Auto-Detect Patterns"
            description="Automatically detect behavioral patterns (revenge trading, overtrading, etc.)"
            icon={Brain}
            enabled={preferences.auto_pattern_detection}
            onChange={(enabled) => setPreferences({ ...preferences, auto_pattern_detection: enabled })}
          />

          <ToggleCard
            title="Smart Suggestions"
            description="Show contextual suggestions based on your trading patterns"
            icon={Zap}
            enabled={preferences.smart_suggestions_enabled}
            onChange={(enabled) => setPreferences({ ...preferences, smart_suggestions_enabled: enabled })}
          />
        </div>

        {/* Report Schedule */}
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <h3 className="font-semibold text-white mb-4">Report Schedule</h3>
          <p className="text-sm text-gray-400 mb-4">Automatically generate and email performance reports</p>
          <select
            value={preferences.auto_report_schedule || 'off'}
            onChange={(e) => setPreferences({ ...preferences, auto_report_schedule: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Note: Email delivery requires email service configuration
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saved && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Preferences saved</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

