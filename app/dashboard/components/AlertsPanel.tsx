'use client'

import { useState, useEffect } from 'react'

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'success' | 'info'
  icon: string
  title: string
  description: string
  time: string
  action?: string
  actionUrl?: string
}

interface AlertsPanelProps {
  trades: any[]
}

export function AlertsPanel({ trades }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    // Generate alerts based on trades
    const newAlerts: Alert[] = []

    // Check for high tilt
    const recentLosses = trades.slice(0, 5).filter(t => (t.pnl || 0) < 0).length
    if (recentLosses >= 3) {
      newAlerts.push({
        id: '1',
        type: 'critical',
        icon: '🔴',
        title: 'HIGH TILT RISK',
        description: `${recentLosses} losses in last 5 trades`,
        time: '2 mins ago',
        action: 'Take a break'
      })
    }

    // Check for loss streak
    let lossStreak = 0
    for (const trade of trades) {
      if ((trade.pnl || 0) < 0) {
        lossStreak++
      } else {
        break
      }
    }
    if (lossStreak >= 3) {
      newAlerts.push({
        id: '2',
        type: 'warning',
        icon: '🟡',
        title: 'LOSS STREAK',
        description: `${lossStreak} consecutive losses`,
        time: '15 mins ago',
        action: 'Review strategy'
      })
    }

    // Check for best performing symbol
    const symbolPnL: Record<string, number> = {}
    trades.forEach(t => {
      if (!symbolPnL[t.tradingsymbol]) symbolPnL[t.tradingsymbol] = 0
      symbolPnL[t.tradingsymbol] += t.pnl || 0
    })
    const bestSymbol = Object.entries(symbolPnL).sort((a, b) => b[1] - a[1])[0]
    if (bestSymbol && bestSymbol[1] > 0) {
      newAlerts.push({
        id: '3',
        type: 'success',
        icon: '🟢',
        title: `${bestSymbol[0]} PROFITABLE`,
        description: `+₹${bestSymbol[1].toFixed(2)} total`,
        time: '1 hour ago',
        action: 'See details'
      })
    }

    setAlerts(newAlerts)
  }, [trades])

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-900/20 border-red-500/30 text-red-400'
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400'
      case 'success':
        return 'bg-green-900/20 border-green-500/30 text-green-400'
      case 'info':
        return 'bg-blue-900/20 border-blue-500/30 text-blue-400'
    }
  }

  if (alerts.length === 0) return null

  return (
    <div className="hidden lg:block fixed right-6 top-24 w-80 z-40">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">🔔 Live Alerts</span>
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">
              {alerts.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Live</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Alerts List */}
        {isExpanded && (
          <div className="max-h-[500px] overflow-y-auto">
            <div className="p-3 space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-xl p-4 hover:scale-[1.02] transition-all cursor-pointer ${getAlertStyles(alert.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{alert.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm mb-1">{alert.title}</h4>
                      <p className="text-xs text-gray-400 mb-2">{alert.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{alert.time}</span>
                        {alert.action && (
                          <button className="text-xs font-semibold hover:underline">
                            {alert.action} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => setAlerts([])}
            className="w-full text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear all alerts
          </button>
        </div>
      </div>
    </div>
  )
}
