'use client'

import { useSettings } from '../SettingsClient'
import { TrendingUp, BarChart3, Brain, FileText, Calendar } from 'lucide-react'

export function UsageStatsCard() {
  const { stats } = useSettings()

  const statsData = [
    {
      icon: BarChart3,
      label: 'Trades Analyzed',
      value: stats.trades_count || 0,
      color: 'text-blue-400'
    },
    {
      icon: Brain,
      label: 'AI Suggestions',
      value: stats.ai_calls || 0,
      color: 'text-purple-400'
    },
    {
      icon: TrendingUp,
      label: 'Patterns Detected',
      value: stats.patterns_detected || 0,
      color: 'text-green-400'
    },
    {
      icon: FileText,
      label: 'Reports Generated',
      value: stats.reports_generated || 0,
      color: 'text-yellow-400'
    }
  ]

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111111] p-6 space-y-6 sticky top-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Usage Statistics</h2>
      </div>

      <div className="space-y-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="p-4 rounded-lg bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-gray-400">{stat.label}</span>
                </div>
                <span className={`text-lg font-bold ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-gray-800">
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="text-xs text-gray-400 mb-1">Next Billing</div>
          <div className="text-sm font-medium text-white">Jan 15, 2025</div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-800">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Usage</span>
            <span className="text-white font-medium">42%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: '42%' }}
            />
          </div>
          <p className="text-xs text-gray-500">of Pro limit</p>
        </div>
      </div>
    </div>
  )
}

