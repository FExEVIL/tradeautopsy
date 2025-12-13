'use client'

import { useSettings } from '../SettingsClient'
import { CreditCard, Receipt, TrendingUp, Crown } from 'lucide-react'

export function AccountBillingSettings() {
  const { preferences, stats } = useSettings()

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111111] p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Account & Billing</h2>
      </div>

      <div className="space-y-6">
        {/* Subscription Status */}
        <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-white">Current Plan</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-medium">
              Free
            </span>
          </div>
          <p className="text-xs text-gray-400">Upgrade to Pro for advanced features and unlimited trades</p>
          <button className="w-full mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white transition-colors">
            Upgrade to Pro
          </button>
        </div>

        {/* Usage Statistics */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-300">Usage This Month</label>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Trades Analyzed</span>
              <span className="text-white font-medium">{stats.trades_count || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">AI Suggestions</span>
              <span className="text-white font-medium">{stats.ai_calls || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Patterns Detected</span>
              <span className="text-white font-medium">{stats.patterns_detected || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Reports Generated</span>
              <span className="text-white font-medium">{stats.reports_generated || 0}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-300">Payment Method</label>
          </div>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <p className="text-sm text-gray-400">No payment method on file</p>
            <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Invoice History */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-300">Invoice History</label>
          </div>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <p className="text-sm text-gray-400">No invoices yet</p>
          </div>
        </div>
      </div>
    </div>
  )
}

