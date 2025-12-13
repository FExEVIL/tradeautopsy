'use client'

import { BarChart3, TrendingUp, AlertTriangle, Info, Ban, Clock } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface AlertStat {
  alert_type: string
  total: number
  heeded: number
  helpful: number
  not_helpful: number
  dismissed: number
  heeded_rate: number
  helpful_rate: number
  avg_confidence: number
}

interface AlertAnalyticsClientProps {
  stats: AlertStat[]
}

const alertTypeLabels: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  tilt_warning: { label: 'Tilt Warning', icon: AlertTriangle, color: '#ef4444' },
  avoid_trading: { label: 'Avoid Trading', icon: Ban, color: '#f59e0b' },
  best_time: { label: 'Best Time', icon: Clock, color: '#3b82f6' },
  take_break: { label: 'Take Break', icon: Info, color: '#8b5cf6' }
}

export function AlertAnalyticsClient({ stats }: AlertAnalyticsClientProps) {
  const chartData = stats.map(stat => ({
    name: alertTypeLabels[stat.alert_type]?.label || stat.alert_type,
    'Heeded Rate': stat.heeded_rate,
    'Helpful Rate': stat.helpful_rate,
    'Avg Confidence': stat.avg_confidence * 100
  }))

  const overallStats = stats.reduce((acc, stat) => ({
    total: acc.total + stat.total,
    heeded: acc.heeded + stat.heeded,
    helpful: acc.helpful + stat.helpful,
    not_helpful: acc.not_helpful + stat.not_helpful
  }), { total: 0, heeded: 0, helpful: 0, not_helpful: 0 })

  const overallHeededRate = overallStats.total > 0 
    ? (overallStats.heeded / overallStats.total) * 100 
    : 0
  const overallHelpfulRate = (overallStats.helpful + overallStats.not_helpful) > 0
    ? (overallStats.helpful / (overallStats.helpful + overallStats.not_helpful)) * 100
    : 0

  if (stats.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No alert data available yet. Alerts will appear here once you start receiving them.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Alert Effectiveness Analytics
          </h1>
          <p className="text-gray-400 mt-2">Track how effective your predictive alerts are</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
            <div className="text-sm text-gray-400 mb-1">Total Alerts</div>
            <div className="text-3xl font-bold text-white">{overallStats.total}</div>
          </div>
          <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
            <div className="text-sm text-gray-400 mb-1">Heeded Rate</div>
            <div className="text-3xl font-bold text-green-400">{overallHeededRate.toFixed(1)}%</div>
          </div>
          <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
            <div className="text-sm text-gray-400 mb-1">Helpful Rate</div>
            <div className="text-3xl font-bold text-blue-400">{overallHelpfulRate.toFixed(1)}%</div>
          </div>
          <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
            <div className="text-sm text-gray-400 mb-1">Feedback Given</div>
            <div className="text-3xl font-bold text-yellow-400">{overallStats.helpful + overallStats.not_helpful}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <h2 className="text-xl font-semibold text-white mb-6">Alert Performance by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="Heeded Rate" fill="#22c55e" />
              <Bar dataKey="Helpful Rate" fill="#3b82f6" />
              <Bar dataKey="Avg Confidence" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Stats Table */}
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <h2 className="text-xl font-semibold text-white mb-6">Detailed Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Alert Type</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Total</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Heeded</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Heeded Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Helpful</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Not Helpful</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Helpful Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Avg Confidence</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, idx) => {
                  const typeInfo = alertTypeLabels[stat.alert_type]
                  const Icon = typeInfo?.icon || Info
                  return (
                    <tr key={stat.alert_type} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {typeInfo && <Icon className="w-4 h-4" style={{ color: typeInfo.color }} />}
                          <span className="text-white">{typeInfo?.label || stat.alert_type}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-300">{stat.total}</td>
                      <td className="text-right py-3 px-4 text-green-400">{stat.heeded}</td>
                      <td className="text-right py-3 px-4 text-gray-300">{stat.heeded_rate.toFixed(1)}%</td>
                      <td className="text-right py-3 px-4 text-blue-400">{stat.helpful}</td>
                      <td className="text-right py-3 px-4 text-red-400">{stat.not_helpful}</td>
                      <td className="text-right py-3 px-4 text-gray-300">{stat.helpful_rate.toFixed(1)}%</td>
                      <td className="text-right py-3 px-4 text-yellow-400">{(stat.avg_confidence * 100).toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
