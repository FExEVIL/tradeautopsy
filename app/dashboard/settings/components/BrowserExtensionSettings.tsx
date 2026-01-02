'use client'

import { Puzzle, Chrome, ExternalLink, Download } from 'lucide-react'
import Link from 'next/link'

export function BrowserExtensionSettings() {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#111111] p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Puzzle className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-semibold text-white">Browser Extension</h2>
        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
          New
        </span>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
          <p className="text-sm text-gray-300 mb-3">
            Connect the TradeAutopsy browser extension to track your trading rules and goals in real-time, 
            right from your browser toolbar.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Chrome className="w-4 h-4" />
            <span>Available for Chrome • Firefox & Edge coming soon</span>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="p-1.5 bg-emerald-500/10 rounded">
              <Puzzle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Real-time P&L</p>
              <p className="text-xs text-gray-400">See daily performance at a glance</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="p-1.5 bg-blue-500/10 rounded">
              <Puzzle className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Rule Alerts</p>
              <p className="text-xs text-gray-400">Get warned before breaking rules</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="p-1.5 bg-purple-500/10 rounded">
              <Puzzle className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Goal Tracking</p>
              <p className="text-xs text-gray-400">Monitor progress towards goals</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="p-1.5 bg-yellow-500/10 rounded">
              <Puzzle className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Desktop Notifications</p>
              <p className="text-xs text-gray-400">Instant alerts for violations</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
          <Link
            href="/dashboard/settings/extension"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Puzzle className="w-4 h-4" />
            Manage Extension Settings
          </Link>
          <a
            href="https://chrome.google.com/webstore/detail/tradeautopsy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Install from Chrome Web Store
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>

        {/* Quick Setup */}
        <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
          <p className="text-xs font-medium text-gray-400 mb-2">Quick Setup:</p>
          <ol className="text-xs text-gray-500 space-y-1 ml-4 list-decimal">
            <li>Install the extension from Chrome Web Store</li>
            <li>Go to Extension Settings and generate an API token</li>
            <li>Paste the token in the extension popup</li>
            <li>Start tracking your rules and goals!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

