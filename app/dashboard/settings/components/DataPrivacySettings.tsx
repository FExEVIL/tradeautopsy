'use client'

import { useSettings } from '../SettingsClient'
import { Shield, Download, Trash2, Database } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function DataPrivacySettings() {
  const { preferences, updatePreferences, isSaving } = useSettings()
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    setExporting(true)
    try {
      const client = createClient()
      const { data: { user } } = await client.auth.getUser()
      if (!user) return

      // In a real implementation, this would call an API route to generate the export
      const response = await fetch(`/api/export?format=${format}`, {
        method: 'GET',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `trades-export-${new Date().toISOString()}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteTrades = async () => {
    if (!confirm('Are you sure you want to delete your trade history? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/trades/delete-all', {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Trade history deleted successfully')
        // Refresh the page to reflect changes
        window.location.reload()
      } else {
        const data = await response.json()
        alert('Error deleting trades: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Error deleting trades. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111111] p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Data & Privacy</h2>
      </div>

      <div className="space-y-6">
        {/* Data Export */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-300">Export Data</label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-100 transition-colors disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-100 transition-colors disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export JSON'}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-100 transition-colors disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
          <p className="text-xs text-gray-500">Download your trading data in various formats</p>
        </div>

        {/* Data Retention */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-300">Data Retention</label>
          </div>
          <select
            value={preferences.data_retention || '1_year'}
            onChange={(e) => updatePreferences({ data_retention: e.target.value })}
            disabled={isSaving}
            className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none disabled:opacity-50"
          >
            <option value="30_days">30 Days</option>
            <option value="1_year">1 Year</option>
            <option value="forever">Forever</option>
          </select>
          <p className="text-xs text-gray-500">How long to keep your trading data</p>
        </div>

        {/* Delete Trade History */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-400" />
            <label className="text-sm font-medium text-red-400">Delete Trade History</label>
          </div>
          <button
            onClick={handleDeleteTrades}
            disabled={deleting}
            className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-sm text-red-400 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete All Trades'}
          </button>
          <p className="text-xs text-gray-500">Permanently delete all your trading history. This action cannot be undone.</p>
        </div>

        {/* Account Deletion */}
        <div className="space-y-3 pt-4 border-t border-red-600/30">
          <label className="text-sm font-medium text-red-400">Delete Account</label>
          <button
            onClick={() => alert('Account deletion feature coming soon')}
            className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-sm text-red-400 transition-colors"
          >
            Delete Account
          </button>
          <p className="text-xs text-gray-500">Permanently delete your account and all associated data</p>
        </div>
      </div>
    </div>
  )
}

