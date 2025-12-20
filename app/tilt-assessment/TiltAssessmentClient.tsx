'use client'

import { useMemo } from 'react'
import {
  AlertTriangle,
  TrendingUp,
  Brain,
  Clock,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmotionalState } from '@/lib/emotional-engine/calculator'
import { DetectedPattern } from '@/lib/ai-coach'
import { format } from 'date-fns'

interface TiltIndicator {
  id: string
  name: string
  severity: 'low' | 'medium' | 'high'
  detected: boolean
  description: string
  occurrences: number
  lastOccurrence?: Date
  recommendation: string
}

interface TiltSession {
  id: string
  startTime: Date
  endTime?: Date
  tradesAffected: number
  totalLoss: number
  triggerEvent: string
  recoveryActions: string[]
}

interface TiltAssessmentClientProps {
  trades: any[]
  tiltScore: number
  patterns: DetectedPattern[]
  emotionalState: EmotionalState | null
}

export function TiltAssessmentClient({
  trades,
  tiltScore,
  patterns,
  emotionalState,
}: TiltAssessmentClientProps) {
  // Generate tilt indicators from patterns
  const indicators: TiltIndicator[] = useMemo(() => {
    const indicatorList: TiltIndicator[] = []

    // Revenge Trading
    const revengePattern = patterns.find(p => p.type === 'revenge_trading')
    if (revengePattern && revengePattern.frequency > 0) {
      indicatorList.push({
        id: '1',
        name: 'Revenge Trading',
        severity: revengePattern.frequency > 10 ? 'high' : revengePattern.frequency > 5 ? 'medium' : 'low',
        detected: true,
        description: 'Taking trades within 30 minutes of a loss',
        occurrences: revengePattern.frequency,
        lastOccurrence: trades.length > 0 ? new Date(trades[trades.length - 1].trade_date || trades[trades.length - 1].created_at) : undefined,
        recommendation: 'Wait at least 1 hour after a loss. Take a short walk or break.',
      })
    }

    // Overtrading
    const overtradingPattern = patterns.find(p => p.type === 'overtrading')
    if (overtradingPattern && overtradingPattern.frequency > 0) {
      indicatorList.push({
        id: '2',
        name: 'Overtrading',
        severity: overtradingPattern.frequency > 5 ? 'high' : 'medium',
        detected: true,
        description: 'Exceeding daily trade limit',
        occurrences: overtradingPattern.frequency,
        lastOccurrence: trades.length > 0 ? new Date(trades[trades.length - 1].trade_date || trades[trades.length - 1].created_at) : undefined,
        recommendation: 'Set a hard limit of 5 trades per day. Stop after reaching it.',
      })
    }

    // Position Size Increase
    const revengeSizingPattern = patterns.find(p => p.type === 'revenge_sizing')
    if (revengeSizingPattern && revengeSizingPattern.frequency > 0) {
      indicatorList.push({
        id: '3',
        name: 'Position Size Increase',
        severity: revengeSizingPattern.frequency > 5 ? 'high' : 'medium',
        detected: true,
        description: 'Increasing position size after losses',
        occurrences: revengeSizingPattern.frequency,
        lastOccurrence: trades.length > 0 ? new Date(trades[trades.length - 1].trade_date || trades[trades.length - 1].created_at) : undefined,
        recommendation: 'Never increase size after a loss. Use fixed position sizing.',
      })
    }

    return indicatorList
  }, [patterns, trades])

  // Detect tilt sessions (consecutive losses with emotional trading)
  const recentSessions: TiltSession[] = useMemo(() => {
    const sessions: TiltSession[] = []
    
    if (trades.length < 2) return sessions

    // Find sequences of losses with short time gaps (potential tilt sessions)
    let currentSession: TiltSession | null = null
    let consecutiveLosses = 0

    for (let i = 1; i < trades.length; i++) {
      const trade = trades[i]
      const prevTrade = trades[i - 1]
      
      const prevPnL = typeof prevTrade.pnl === 'string' ? parseFloat(prevTrade.pnl) : (prevTrade.pnl || 0)
      const currentPnL = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : (trade.pnl || 0)
      
      const prevDate = new Date(prevTrade.trade_date || prevTrade.created_at)
      const currentDate = new Date(trade.trade_date || trade.created_at)
      const timeDiff = currentDate.getTime() - prevDate.getTime()
      const minutesDiff = timeDiff / (1000 * 60)

      // If previous trade was a loss and current trade is within 1 hour
      if (prevPnL < 0 && minutesDiff < 60) {
        if (!currentSession) {
          currentSession = {
            id: `session-${i}`,
            startTime: prevDate,
            tradesAffected: 1,
            totalLoss: Math.abs(prevPnL),
            triggerEvent: `Lost ₹${Math.abs(prevPnL).toFixed(2)} on ${prevTrade.symbol || 'trade'}`,
            recoveryActions: [],
          }
        }
        
        currentSession.tradesAffected++
        currentSession.totalLoss += Math.abs(currentPnL)
        consecutiveLosses++
      } else {
        // Session ended
        if (currentSession && consecutiveLosses >= 2) {
          currentSession.endTime = prevDate
          currentSession.recoveryActions = ['Stopped trading', 'Took a break']
          sessions.push(currentSession)
        }
        currentSession = null
        consecutiveLosses = 0
      }
    }

    // Add final session if exists
    if (currentSession && consecutiveLosses >= 2) {
      currentSession.endTime = new Date()
      currentSession.recoveryActions = ['Stopped trading']
      sessions.push(currentSession)
    }

    return sessions.slice(-5) // Return last 5 sessions
  }, [trades])

  const getTiltStatus = (score: number): { status: string; color: string; message: string } => {
    // Ensure score is a valid number
    const validScore = isNaN(score) || !isFinite(score) ? 0 : score
    
    if (validScore <= 20) {
      return {
        status: 'Excellent',
        color: 'text-green-400',
        message: 'Your tilt control is excellent. Keep it up!',
      }
    } else if (validScore <= 40) {
      return {
        status: 'Good',
        color: 'text-blue-400',
        message: 'You have good tilt control with minor issues.',
      }
    } else if (validScore <= 60) {
      return {
        status: 'Warning',
        color: 'text-yellow-400',
        message: 'Moderate tilt detected. Take preventive action.',
      }
    } else {
      return {
        status: 'Critical',
        color: 'text-red-400',
        message: '🚨 High tilt risk! Stop trading and take a break.',
      }
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10'
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10'
      case 'low':
        return 'border-blue-500/30 bg-blue-500/10'
      default:
        return 'border-gray-700 bg-gray-800/50'
    }
  }

  // Ensure tiltScore is valid before using
  const validTiltScore = isNaN(tiltScore) || !isFinite(tiltScore) ? 0 : Math.max(0, Math.min(100, tiltScore))
  const tiltStatus = getTiltStatus(validTiltScore)
  const activeIndicators = indicators.filter((i) => i.detected)
  const totalOccurrences = indicators.reduce((sum, i) => sum + i.occurrences, 0)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Tilt Assessment</h1>
          </div>
          <p className="text-gray-400">
            Real-time detection and prevention of emotional trading patterns
          </p>
        </div>

        {/* Tilt Score Card */}
        <Card variant="darker">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-400 mb-2">CURRENT TILT RISK</h2>
              <div className="flex items-end gap-4 mb-4">
                <div className={`text-6xl font-bold ${tiltStatus.color}`}>
                  {Math.round(validTiltScore)}
                </div>
                <div className="pb-2">
                  <div className={`text-2xl font-semibold ${tiltStatus.color} mb-1`}>
                    {tiltStatus.status}
                  </div>
                  <p className="text-gray-400 text-sm">{tiltStatus.message}</p>
                </div>
              </div>

              {/* Tilt Bar */}
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    validTiltScore <= 20
                      ? 'bg-green-500'
                      : validTiltScore <= 40
                      ? 'bg-blue-500'
                      : validTiltScore <= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${validTiltScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>0 (Best)</span>
                <span>100 (Worst)</span>
              </div>
            </div>

            {/* Visual Indicator */}
            <div className="relative w-48 h-48 ml-8">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-800"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(validTiltScore / 100) * 552.92} 552.92`}
                  className={
                    validTiltScore <= 20
                      ? 'text-green-400'
                      : validTiltScore <= 40
                      ? 'text-blue-400'
                      : validTiltScore <= 60
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {validTiltScore <= 20 ? '😊' : validTiltScore <= 40 ? '😐' : validTiltScore <= 60 ? '😟' : '😡'}
                  </div>
                  <div className="text-xs text-gray-500">Tilt Level</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card variant="darker">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Activity className="w-4 h-4" />
              <span>Active Indicators</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{activeIndicators.length}</p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Zap className="w-4 h-4" />
              <span>Total Occurrences</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalOccurrences}</p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Clock className="w-4 h-4" />
              <span>Recent Sessions</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{recentSessions.length}</p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Tilt Impact</span>
            </div>
            <p className="text-3xl font-bold text-red-400">
              ₹
              {recentSessions
                .reduce((sum, s) => sum + Math.abs(s.totalLoss), 0)
                .toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </Card>
        </div>

        {/* Active Tilt Indicators */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Detected Tilt Indicators
          </h2>

          {activeIndicators.length === 0 ? (
            <Card variant="darker" className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Active Tilt Indicators</h3>
              <p className="text-gray-400">Great job! Your emotional control is excellent.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {indicators
                .filter((i) => i.detected)
                .map((indicator) => (
                  <Card
                    key={indicator.id}
                    variant="darker"
                    className={`border ${getSeverityColor(indicator.severity)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-900 rounded-lg">
                        {indicator.severity === 'high' ? (
                          <XCircle className="w-6 h-6 text-red-400" />
                        ) : indicator.severity === 'medium' ? (
                          <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        ) : (
                          <Activity className="w-6 h-6 text-blue-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">
                                {indicator.name}
                              </h3>
                              <span
                                className={`px-2 py-0.5 text-xs rounded font-semibold ${
                                  indicator.severity === 'high'
                                    ? 'bg-red-500/20 text-red-400'
                                    : indicator.severity === 'medium'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}
                              >
                                {indicator.severity.toUpperCase()} SEVERITY
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{indicator.description}</p>
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-bold text-white mb-1">
                              {indicator.occurrences}
                            </div>
                            <p className="text-xs text-gray-500">Occurrences</p>
                          </div>
                        </div>

                        {indicator.lastOccurrence && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <Clock className="w-4 h-4" />
                            <span>
                              Last occurred:{' '}
                              {Math.floor(
                                (Date.now() - indicator.lastOccurrence.getTime()) / (1000 * 60 * 60)
                              )}{' '}
                              hours ago
                            </span>
                          </div>
                        )}

                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-semibold text-green-400">
                              Recommended Action
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{indicator.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>

        {/* Recent Tilt Sessions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Recent Tilt Sessions
          </h2>

          {recentSessions.length === 0 ? (
            <Card variant="darker" className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Recent Tilt Sessions
              </h3>
              <p className="text-gray-400">Excellent emotional control!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <Card key={session.id} variant="darker">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">Tilt Session</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        <strong>Trigger:</strong> {session.triggerEvent}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(session.startTime, 'PPp')}
                        </span>
                        {session.endTime && (
                          <span>
                            Duration:{' '}
                            {Math.floor(
                              (session.endTime.getTime() - session.startTime.getTime()) /
                                (1000 * 60)
                            )}{' '}
                            minutes
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-400 mb-1">
                        ₹{Math.abs(session.totalLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                      <p className="text-sm text-gray-400">{session.tradesAffected} trades affected</p>
                    </div>
                  </div>

                  {session.recoveryActions.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Recovery Actions Taken
                      </h4>
                      <ul className="space-y-1">
                        {session.recoveryActions.map((action, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-green-400">✓</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

