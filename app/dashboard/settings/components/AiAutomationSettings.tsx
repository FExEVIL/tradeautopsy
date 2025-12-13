'use client'

import { useSettings } from '../SettingsClient'
import { Bot, Zap, Tag, Brain, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function AiAutomationSettings() {
  const { preferences, updatePreferences, isSaving } = useSettings()
  const [automationPrefs, setAutomationPrefs] = useState<any>(null)

  useEffect(() => {
    const loadAutomationPrefs = async () => {
      const client = createClient()
      const { data: { user } } = await client.auth.getUser()
      if (!user) return

      const { data } = await client
        .from('automation_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      setAutomationPrefs(data || {
        auto_tag_enabled: true,
        auto_categorize_enabled: true,
        auto_pattern_detection: true,
        auto_report_schedule: 'off',
        smart_suggestions_enabled: true
      })
    }
    loadAutomationPrefs()
  }, [])

  const handleToggle = async (key: string) => {
    const client = createClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return

    const updated = { ...automationPrefs, [key]: !automationPrefs[key] }
    setAutomationPrefs(updated)

    await client
      .from('automation_preferences')
      .upsert({
        user_id: user.id,
        ...updated,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
  }

  const handleReportSchedule = async (value: string) => {
    const client = createClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return

    const updated = { ...automationPrefs, auto_report_schedule: value }
    setAutomationPrefs(updated)

    await client
      .from('automation_preferences')
      .upsert({
        user_id: user.id,
        ...updated,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
  }

  const handleAICoachToggle = () => {
    updatePreferences({ ai_coach_enabled: !preferences.ai_coach_enabled })
  }

  if (!automationPrefs) {
    return (
      <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
        <div className="text-gray-400">Loading automation settings...</div>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">AI & Automation</h2>
      </div>

      <div className="space-y-6">
        {/* AI Coach */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-300">AI Coach Suggestions</label>
              <p className="text-xs text-gray-500">Get personalized trading insights and recommendations</p>
            </div>
          </div>
          <button
            onClick={handleAICoachToggle}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              preferences.ai_coach_enabled !== false ? 'bg-blue-600' : 'bg-gray-700'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.ai_coach_enabled !== false ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Auto Tagging */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-300">Auto-Tag Trades</label>
              <p className="text-xs text-gray-500">Automatically tag trades based on outcome and patterns</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('auto_tag_enabled')}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              automationPrefs.auto_tag_enabled ? 'bg-blue-600' : 'bg-gray-700'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                automationPrefs.auto_tag_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Auto Pattern Detection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-300">Auto-Pattern Detection</label>
              <p className="text-xs text-gray-500">Automatically detect behavioral patterns in your trades</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('auto_pattern_detection')}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              automationPrefs.auto_pattern_detection ? 'bg-blue-600' : 'bg-gray-700'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                automationPrefs.auto_pattern_detection ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Auto Strategy Categorization */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-300">Auto-Strategy Categorization</label>
              <p className="text-xs text-gray-500">Automatically categorize trades by strategy type</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('auto_categorize_enabled')}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              automationPrefs.auto_categorize_enabled ? 'bg-blue-600' : 'bg-gray-700'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                automationPrefs.auto_categorize_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Report Schedule */}
        <div className="space-y-2 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-300">Report Schedule</label>
          </div>
          <select
            value={automationPrefs.auto_report_schedule || 'off'}
            onChange={(e) => handleReportSchedule(e.target.value)}
            disabled={isSaving}
            className="w-full rounded-lg border border-white/10 bg-[#0F0F0F] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
          >
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <p className="text-xs text-gray-500">Automatically generate and email performance reports</p>
        </div>
      </div>
    </div>
  )
}

