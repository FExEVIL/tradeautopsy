'use client'

import { X, TrendingUp, TrendingDown, AlertTriangle, Calendar, Target, Clock } from 'lucide-react'
import { formatINR } from '@/lib/formatters'
import { format } from 'date-fns'

interface MorningBriefData {
  yesterdayPnL: number
  yesterdayWinRate: number
  yesterdayTrades: number
  rulesViolated: Array<{ rule: string; count: number }>
  focusPoints: string[]
  todayEvents: Array<{ title: string; time: string; impact: string }>
}

interface MorningBriefPageClientProps {
  brief: MorningBriefData
}

export default function MorningBriefPageClient({ brief }: MorningBriefPageClientProps) {
  const handleMarkAsRead = async () => {
    try {
      await fetch('/api/morning-brief/read', { method: 'POST' })
    } catch (error) {
      // Silently handle network errors
      console.warn('Failed to mark brief as read:', error)
    }
    localStorage.setItem('morning_brief_last_read', new Date().toDateString())
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-400" />
            Morning Brief
          </h1>
          <p className="text-gray-400 mt-1">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
        <button
          onClick={handleMarkAsRead}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Mark as Read
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yesterday's Performance */}
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Yesterday's Performance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Net P&L</div>
              <div className={`text-3xl font-bold ${
                brief.yesterdayPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatINR(brief.yesterdayPnL)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Trades</div>
                <div className="text-xl font-semibold text-white">{brief.yesterdayTrades}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                <div className="text-xl font-semibold text-white">
                  {brief.yesterdayWinRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rule Violations */}
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Rule Violations</h2>
          </div>
          {brief.rulesViolated.length > 0 ? (
            <div className="space-y-2">
              {brief.rulesViolated.map((violation, idx) => (
                <div key={idx} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="text-sm font-medium text-red-400">{violation.rule}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Violated {violation.count} time{violation.count > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-400 text-lg font-semibold mb-2">✓ All Clear</div>
              <div className="text-sm text-gray-400">No rule violations yesterday</div>
            </div>
          )}
        </div>

        {/* Today's Focus */}
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Today's Focus</h2>
          </div>
          {brief.focusPoints.length > 0 ? (
            <ul className="space-y-3">
              {brief.focusPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 text-xs font-bold">{idx + 1}</span>
                  </div>
                  <p className="text-gray-300 flex-1">{point}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No specific focus points today</div>
            </div>
          )}
        </div>

        {/* Economic Events */}
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Economic Events Today</h2>
          </div>
          {brief.todayEvents.length > 0 ? (
            <div className="space-y-3">
              {brief.todayEvents.map((event, idx) => (
                <div key={idx} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{event.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{event.time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          event.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          event.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {event.impact.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No high-impact events scheduled today</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
