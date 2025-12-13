'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, AlertTriangle, Calendar, Target } from 'lucide-react'
import { formatINR } from '@/lib/formatters'

interface MorningBriefData {
  yesterdayPnL: number
  yesterdayWinRate: number
  yesterdayTrades: number
  rulesViolated: Array<{ rule: string; count: number }>
  focusPoints: string[]
  todayEvents: Array<{ title: string; time: string; impact: string }>
}

export function MorningBrief() {
  const [brief, setBrief] = useState<MorningBriefData | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBrief()
    
    // Check if already read today
    const lastRead = localStorage.getItem('morning_brief_last_read')
    const today = new Date().toDateString()
    if (lastRead === today) {
      setIsDismissed(true)
    }
  }, [])

  const loadBrief = async () => {
    try {
      let response: Response
      try {
        response = await fetch('/api/morning-brief')
      } catch (fetchError: any) {
        // Network error - silently fail
        if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          console.warn('Morning brief not available: network error')
          setIsDismissed(true)
          setLoading(false)
          return
        }
        throw fetchError
      }
      
      if (response.ok) {
        const data = await response.json()
        setBrief(data)
      } else {
        // API exists but returned error - don't show brief
        console.warn('Morning brief API returned error:', response.status)
        setIsDismissed(true)
      }
    } catch (error) {
      // Network error or API doesn't exist - silently fail
      console.warn('Morning brief not available:', error)
      setIsDismissed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async () => {
    setIsDismissed(true)
    localStorage.setItem('morning_brief_last_read', new Date().toDateString())
    
    // Mark as read on server (silently fail if network error)
    try {
      await fetch('/api/morning-brief/read', { method: 'POST' })
    } catch (error) {
      // Silently handle network errors
      console.warn('Failed to mark brief as read:', error)
    }
  }

  if (isDismissed || loading || !brief) {
    return null
  }

  return (
    <div className="mb-6 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Morning Brief</h2>
        <span className="text-xs text-gray-400">Today</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Yesterday's Performance */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Yesterday's P&L</div>
          <div className={`text-xl font-bold flex items-center gap-2 ${
            brief.yesterdayPnL >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {brief.yesterdayPnL >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            {formatINR(brief.yesterdayPnL)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {brief.yesterdayTrades} trades • {brief.yesterdayWinRate.toFixed(1)}% win rate
          </div>
        </div>

        {/* Rule Violations */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Rules Violated</div>
          {brief.rulesViolated.length > 0 ? (
            <div className="space-y-1">
              {brief.rulesViolated.slice(0, 2).map((v, idx) => (
                <div key={idx} className="text-sm text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {v.rule} ({v.count}x)
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-green-400">All rules followed ✓</div>
          )}
        </div>

        {/* Focus Points */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Today's Focus</div>
          {brief.focusPoints.length > 0 ? (
            <ul className="text-sm text-white space-y-1">
              {brief.focusPoints.slice(0, 2).map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span className="line-clamp-2">{point}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-400">No specific focus points</div>
          )}
        </div>

        {/* Today's Events */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            High-Impact Events
          </div>
          {brief.todayEvents.length > 0 ? (
            <ul className="text-sm text-white space-y-1">
              {brief.todayEvents.slice(0, 2).map((event, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-red-400 text-xs">{event.time}</span>
                  <span className="line-clamp-1">{event.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-400">No high-impact events today</div>
          )}
        </div>
      </div>
    </div>
  )
}
