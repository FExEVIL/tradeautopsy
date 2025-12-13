'use client'

import { useState, useEffect } from 'react'
import { Bell, Save, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface AlertPreferences {
  user_id: string
  tilt_warning_enabled: boolean
  avoid_trading_enabled: boolean
  best_time_enabled: boolean
  take_break_enabled: boolean
  notification_frequency: 'low' | 'normal' | 'high'
  quiet_hours_start: string | null
  quiet_hours_end: string | null
}

interface AlertPreferencesClientProps {
  initialPreferences: AlertPreferences | null
}

export function AlertPreferencesClient({ initialPreferences }: AlertPreferencesClientProps) {
  const [preferences, setPreferences] = useState<AlertPreferences>({
    user_id: '',
    tilt_warning_enabled: initialPreferences?.tilt_warning_enabled ?? true,
    avoid_trading_enabled: initialPreferences?.avoid_trading_enabled ?? true,
    best_time_enabled: initialPreferences?.best_time_enabled ?? true,
    take_break_enabled: initialPreferences?.take_break_enabled ?? true,
    notification_frequency: initialPreferences?.notification_frequency ?? 'normal',
    quiet_hours_start: initialPreferences?.quiet_hours_start ?? null,
    quiet_hours_end: initialPreferences?.quiet_hours_end ?? null
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setPreferences(prev => ({ ...prev, user_id: user.id }))
      }
    }
    fetchUser()
  }, [supabase])

  const handleSave = async () => {
    if (!preferences.user_id) return

    setSaving(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('alert_preferences')
        .upsert({
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-400" />
            Alert Preferences
          </h1>
          <p className="text-gray-400 mt-2">Configure when and how you receive predictive trading alerts</p>
        </div>

        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5 space-y-6">
          {/* Alert Type Toggles */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Alert Types</h2>
            <div className="space-y-4">
              <ToggleOption
                title="Tilt Warning"
                description="Alert when you show signs of emotional trading (consecutive losses + increased position size)"
                enabled={preferences.tilt_warning_enabled}
                onChange={(enabled) => setPreferences(prev => ({ ...prev, tilt_warning_enabled: enabled }))}
              />

              <ToggleOption
                title="Avoid Trading Now"
                description="Warn when your historical performance is poor at the current time of day"
                enabled={preferences.avoid_trading_enabled}
                onChange={(enabled) => setPreferences(prev => ({ ...prev, avoid_trading_enabled: enabled }))}
              />

              <ToggleOption
                title="Best Trading Time"
                description="Notify you about your most profitable trading hours"
                enabled={preferences.best_time_enabled}
                onChange={(enabled) => setPreferences(prev => ({ ...prev, best_time_enabled: enabled }))}
              />

              <ToggleOption
                title="Take a Break"
                description="Suggest taking a break when overtrading or after multiple losses"
                enabled={preferences.take_break_enabled}
                onChange={(enabled) => setPreferences(prev => ({ ...prev, take_break_enabled: enabled }))}
              />
            </div>
          </div>

          {/* Notification Frequency */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Notification Frequency</h2>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'normal', 'high'] as const).map(freq => (
                <button
                  key={freq}
                  onClick={() => setPreferences(prev => ({ ...prev, notification_frequency: freq }))}
                  className={`p-4 rounded-lg border transition-all ${
                    preferences.notification_frequency === freq
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-[#0A0A0A] border-white/5 text-gray-400 hover:border-white/10'
                  }`}
                >
                  <div className="font-semibold capitalize mb-1">{freq}</div>
                  <div className="text-xs text-gray-500">
                    {freq === 'low' && 'Fewer alerts, only critical'}
                    {freq === 'normal' && 'Balanced alerts'}
                    {freq === 'high' && 'All alerts enabled'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Quiet Hours (Optional)</h2>
            <p className="text-sm text-gray-400 mb-4">
              Set hours when you don't want to receive alerts (e.g., during sleep)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start || ''}
                  onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_start: e.target.value || null }))}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end || ''}
                  onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_end: e.target.value || null }))}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleOption({
  title,
  description,
  enabled,
  onChange
}: {
  title: string
  description: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg bg-[#0A0A0A] border border-white/5">
      <div className="flex-1">
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

