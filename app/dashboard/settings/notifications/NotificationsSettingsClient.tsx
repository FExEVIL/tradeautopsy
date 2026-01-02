'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell, Mail, CheckCircle2, Clock, Calendar } from 'lucide-react'
import Link from 'next/link'
import { PageLayout } from '@/components/layouts/PageLayout'

interface EmailPreferences {
  welcome_email: boolean
  weekly_report: boolean
  goal_achieved: boolean
  inactivity_reminder: boolean
  daily_summary: boolean
  weekly_report_day: number
  weekly_report_time: string
  daily_summary_time: string
  inactivity_days: number
  unsubscribe_all: boolean
}

interface NotificationsSettingsClientProps {
  initialPreferences: EmailPreferences | null
}

export default function NotificationsSettingsClient({ initialPreferences }: NotificationsSettingsClientProps) {
  const [preferences, setPreferences] = useState<EmailPreferences>(initialPreferences || {
    welcome_email: true,
    weekly_report: true,
    goal_achieved: true,
    inactivity_reminder: true,
    daily_summary: false,
    weekly_report_day: 0,
    weekly_report_time: '18:00:00',
    daily_summary_time: '16:00:00',
    inactivity_days: 7,
    unsubscribe_all: false,
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

      const response = await fetch('/api/email/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save preferences')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error: any) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const ToggleCard = ({
    title,
    description,
    enabled,
    onChange,
  }: {
    title: string
    description: string
    enabled: boolean
    onChange: (enabled: boolean) => void
  }) => (
    <div className="flex items-start justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg">
      <div className="flex-1">
        <h3 className="text-white font-medium mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
      </label>
    </div>
  )

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ]

  return (
    <PageLayout title="Email Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Email Notifications</h1>
            <p className="text-gray-400">
              Manage your email notification preferences
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </>
            ) : saving ? (
              'Saving...'
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>

        {/* Email Types */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Types
          </h2>

          <ToggleCard
            title="Welcome Email"
            description="Receive a welcome email when you first sign up"
            enabled={preferences.welcome_email && !preferences.unsubscribe_all}
            onChange={(enabled) => setPreferences({ ...preferences, welcome_email: enabled })}
          />

          <ToggleCard
            title="Weekly Performance Report"
            description="Get a weekly summary of your trading performance every Sunday"
            enabled={preferences.weekly_report && !preferences.unsubscribe_all}
            onChange={(enabled) => setPreferences({ ...preferences, weekly_report: enabled })}
          />

          <ToggleCard
            title="Goal Achieved"
            description="Get notified when you achieve a trading goal"
            enabled={preferences.goal_achieved && !preferences.unsubscribe_all}
            onChange={(enabled) => setPreferences({ ...preferences, goal_achieved: enabled })}
          />

          <ToggleCard
            title="Inactivity Reminder"
            description="Receive a reminder if you haven't logged in for a while"
            enabled={preferences.inactivity_reminder && !preferences.unsubscribe_all}
            onChange={(enabled) => setPreferences({ ...preferences, inactivity_reminder: enabled })}
          />

          <ToggleCard
            title="Daily Summary"
            description="Get a daily summary of your trading activity"
            enabled={preferences.daily_summary && !preferences.unsubscribe_all}
            onChange={(enabled) => setPreferences({ ...preferences, daily_summary: enabled })}
          />
        </div>

        {/* Schedule Settings */}
        {preferences.weekly_report && !preferences.unsubscribe_all && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Report Schedule
            </h2>

            <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Day of Week</label>
                <select
                  value={preferences.weekly_report_day}
                  onChange={(e) => setPreferences({ ...preferences, weekly_report_day: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Time</label>
                <input
                  type="time"
                  value={preferences.weekly_report_time}
                  onChange={(e) => setPreferences({ ...preferences, weekly_report_time: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}

        {preferences.daily_summary && !preferences.unsubscribe_all && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Daily Summary Schedule
            </h2>

            <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Time</label>
                <input
                  type="time"
                  value={preferences.daily_summary_time}
                  onChange={(e) => setPreferences({ ...preferences, daily_summary_time: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Inactivity Settings */}
        {preferences.inactivity_reminder && !preferences.unsubscribe_all && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Inactivity Reminder
            </h2>

            <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Days of Inactivity</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={preferences.inactivity_days}
                  onChange={(e) => setPreferences({ ...preferences, inactivity_days: parseInt(e.target.value) || 7 })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Send reminder after this many days of inactivity
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Unsubscribe All */}
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white font-medium mb-1">Unsubscribe from All Emails</h3>
              <p className="text-gray-400 text-sm">
                This will disable all email notifications. You can re-enable them anytime.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.unsubscribe_all}
                onChange={(e) => setPreferences({ ...preferences, unsubscribe_all: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        {/* Test Email Section */}
        <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-medium mb-1">Test Email Templates</h3>
              <p className="text-gray-400 text-sm">
                Send test emails to verify your email templates are working correctly.
              </p>
            </div>
          </div>
          <a
            href="/dashboard/settings/notifications/test-email"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
          >
            <Mail className="w-4 h-4" />
            Test Email Templates
          </a>
        </div>
      </div>
    </PageLayout>
  )
}

