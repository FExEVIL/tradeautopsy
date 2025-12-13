'use client'

import { useSettings } from '../SettingsClient'
import { Settings2, BarChart3, Zap, Bug } from 'lucide-react'
import { useState } from 'react'

export function AdvancedSettings() {
  const { preferences, updatePreferences, isSaving } = useSettings()
  const [clearingCache, setClearingCache] = useState(false)

  const handleClearCache = () => {
    setClearingCache(true)
    // Clear localStorage cache
    localStorage.removeItem('trades-cache')
    localStorage.removeItem('analytics-cache')
    setTimeout(() => {
      setClearingCache(false)
      alert('Cache cleared successfully')
    }, 1000)
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111111] p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Settings2 className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Advanced</h2>
      </div>

      <div className="space-y-6">
        {/* Chart Preferences */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-300">Chart Default View</label>
          </div>
          <select
            defaultValue="cumulative"
            className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none"
          >
            <option value="cumulative">Cumulative P&L</option>
            <option value="daily">Daily P&L</option>
            <option value="monthly">Monthly P&L</option>
          </select>
          <p className="text-xs text-gray-500">Default chart view when opening analytics</p>
        </div>

        {/* Performance Optimization */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-300">Performance Mode</label>
          </div>
          <select
            defaultValue="balanced"
            className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none"
          >
            <option value="fast">Fast (Less Detail)</option>
            <option value="balanced">Balanced</option>
            <option value="detailed">Detailed (Slower)</option>
          </select>
          <p className="text-xs text-gray-500">Balance between performance and detail level</p>
        </div>

        {/* Clear Cache */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <label className="text-sm font-medium text-gray-300">Cache Management</label>
          <button
            onClick={handleClearCache}
            disabled={clearingCache}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-100 transition-colors disabled:opacity-50"
          >
            {clearingCache ? 'Clearing...' : 'Clear Cache'}
          </button>
          <p className="text-xs text-gray-500">Clear cached data to free up storage and refresh data</p>
        </div>

        {/* Debug Mode (Dev Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="space-y-3 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Debug Mode</label>
            </div>
            <button
              onClick={() => {
                const enabled = localStorage.getItem('debug-mode') === 'true'
                localStorage.setItem('debug-mode', (!enabled).toString())
                alert(`Debug mode ${!enabled ? 'enabled' : 'disabled'}`)
              }}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-100 transition-colors"
            >
              Toggle Debug Mode
            </button>
            <p className="text-xs text-gray-500">Enable detailed console logging for development</p>
          </div>
        )}
      </div>
    </div>
  )
}

