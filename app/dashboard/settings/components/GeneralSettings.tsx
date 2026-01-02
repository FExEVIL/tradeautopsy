'use client'

import { useSettings } from '../SettingsClient'
import { Settings, Globe, Calendar, Clock } from 'lucide-react'

export function GeneralSettings() {
  const { preferences, updatePreferences, isSaving } = useSettings()

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-emerald-500/10 rounded-lg">
          <Settings className="w-5 h-5 text-emerald-500" />
        </div>
        <h2 className="text-lg font-semibold text-white">General</h2>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Theme</label>
          <select
            value={preferences.theme || 'system'}
            onChange={(e) => updatePreferences({ theme: e.target.value })}
            disabled={isSaving}
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50 transition-colors"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
          <p className="text-xs text-gray-500">Choose your preferred color theme</p>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Currency
          </label>
          <select
            value={preferences.base_currency || 'INR'}
            onChange={(e) => updatePreferences({ base_currency: e.target.value })}
            disabled={isSaving}
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50 transition-colors"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Format
          </label>
          <select
            value={preferences.date_format || 'DD/MM/YYYY'}
            onChange={(e) => updatePreferences({ date_format: e.target.value })}
            disabled={isSaving}
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50 transition-colors"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Language</label>
          <select
            value={preferences.language || 'en'}
            onChange={(e) => updatePreferences({ language: e.target.value })}
            disabled={isSaving}
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50 transition-colors"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timezone
          </label>
          <select
            value={preferences.timezone || 'Asia/Kolkata'}
            onChange={(e) => updatePreferences({ timezone: e.target.value })}
            disabled={isSaving}
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50 transition-colors"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
          </select>
        </div>

        {/* Default Risk Per Trade */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Default Risk Per Trade ({preferences.base_currency || 'INR'})
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={preferences.risk_per_trade ?? ''}
            onChange={(e) => updatePreferences({ 
              risk_per_trade: e.target.value === '' ? null : Number(e.target.value) 
            })}
            disabled={isSaving}
            className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none disabled:opacity-50"
            placeholder="e.g. 500"
          />
          <p className="text-xs text-gray-500">Default risk amount for new trades</p>
        </div>
      </div>
    </div>
  )
}

