'use client'

import { useSettings } from '../SettingsClient'
import { Bell, Mail, Smartphone, Clock } from 'lucide-react'
import { useState } from 'react'

export function NotificationSettings() {
  const { preferences, updatePreferences, isSaving } = useSettings()
  const [quietHours, setQuietHours] = useState(
    preferences.quiet_hours || { start: '22:00', end: '08:00' }
  )

  const handleToggle = (key: string) => {
    updatePreferences({ [key]: !preferences[key] })
  }

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    const updated = { ...quietHours, [field]: value }
    setQuietHours(updated)
    updatePreferences({ quiet_hours: updated })
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111111] p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Notifications & Alerts</h2>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-300">Email Notifications</label>
              <p className="text-xs text-gray-500">Receive email alerts for important events</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('email_notifications')}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              preferences.email_notifications !== false ? 'bg-blue-600' : 'bg-gray-700'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.email_notifications !== false ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-300">Push Notifications</label>
              <p className="text-xs text-gray-500">Browser push notifications for real-time alerts</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('push_notifications')}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              preferences.push_notifications !== false ? 'bg-blue-600' : 'bg-gray-700'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.push_notifications !== false ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Alert Frequency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Alert Frequency</label>
          <select
            value={preferences.alert_frequency || 'realtime'}
            onChange={(e) => updatePreferences({ alert_frequency: e.target.value })}
            disabled={isSaving}
            className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none disabled:opacity-50"
          >
            <option value="realtime">Real-time</option>
            <option value="hourly">Hourly Digest</option>
            <option value="daily">Daily Summary</option>
          </select>
          <p className="text-xs text-gray-500">How often to receive alerts</p>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-300">Quiet Hours</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Start</label>
              <input
                type="time"
                value={quietHours.start || '22:00'}
                onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                disabled={isSaving}
                className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">End</label>
              <input
                type="time"
                value={quietHours.end || '08:00'}
                onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                disabled={isSaving}
                className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">No notifications during these hours</p>
        </div>
      </div>
    </div>
  )
}

