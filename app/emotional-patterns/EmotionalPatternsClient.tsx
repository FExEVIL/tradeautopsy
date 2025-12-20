'use client'

import { useMemo } from 'react'
import {
  Heart,
  TrendingUp,
  Calendar,
  Activity,
  Smile,
  Frown,
  Meh,
  Zap,
  Brain,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmotionalState } from '@/lib/emotional-engine/calculator'
import { format } from 'date-fns'

interface EmotionEntry {
  id: string
  timestamp: Date
  emotion: 'happy' | 'neutral' | 'stressed' | 'anxious' | 'angry' | 'excited'
  intensity: number // 1-10
  beforeTrade: boolean
  notes?: string
  tradeId?: string
  tradeOutcome?: 'win' | 'loss'
}

interface EmotionalTrend {
  date: Date
  averageIntensity: number
  dominantEmotion: string
  tradeCount: number
  winRate: number
}

interface EmotionalPatternsClientProps {
  trades: any[]
  emotionalState: EmotionalState | null
  emotionEntries: any[]
}

export function EmotionalPatternsClient({
  trades,
  emotionalState,
  emotionEntries,
}: EmotionalPatternsClientProps) {
  // Convert journal entries to emotion entries
  const recentEntries: EmotionEntry[] = useMemo(() => {
    if (!emotionEntries || !Array.isArray(emotionEntries)) {
      return []
    }
    return emotionEntries.slice(0, 10).map((entry, idx) => {
      // Try to extract emotion from summary or transcription
      const text = (entry.summary || entry.transcription || '').toLowerCase()
      let emotion: EmotionEntry['emotion'] = 'neutral'
      if (text.includes('happy') || text.includes('excited') || text.includes('great')) {
        emotion = 'happy'
      } else if (text.includes('stressed') || text.includes('anxious') || text.includes('worried')) {
        emotion = 'stressed'
      } else if (text.includes('angry') || text.includes('frustrated')) {
        emotion = 'angry'
      }

      return {
        id: entry.id || `entry-${idx}`,
        timestamp: new Date(entry.created_at),
        emotion,
        intensity: 5, // Default, could be extracted from text
        beforeTrade: false,
        notes: entry.summary || entry.transcription,
      }
    })
  }, [emotionEntries])

  // Calculate emotional trends from trades
  const trends: EmotionalTrend[] = useMemo(() => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) return []

    // Group trades by date
    const tradesByDate: { [date: string]: any[] } = {}
    trades.forEach(trade => {
      const date = new Date(trade.trade_date || trade.created_at).toISOString().split('T')[0]
      if (!tradesByDate[date]) {
        tradesByDate[date] = []
      }
      tradesByDate[date].push(trade)
    })

    // Calculate trends for each day
    return Object.entries(tradesByDate).slice(-7).map(([date, dayTrades]) => {
      const wins = dayTrades.filter(t => {
        const pnl = typeof t.pnl === 'string' ? parseFloat(t.pnl) : (t.pnl || 0)
        return pnl > 0
      }).length
      const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0

      // Determine dominant emotion based on P&L
      let dominantEmotion = 'neutral'
      const totalPnL = dayTrades.reduce((sum, t) => {
        const pnl = typeof t.pnl === 'string' ? parseFloat(t.pnl) : (t.pnl || 0)
        return sum + pnl
      }, 0)

      if (totalPnL > 1000) {
        dominantEmotion = 'happy'
      } else if (totalPnL < -500) {
        dominantEmotion = 'stressed'
      }

      return {
        date: new Date(date),
        averageIntensity: 5 + (totalPnL / 1000) * 2, // Scale intensity based on P&L
        dominantEmotion,
        tradeCount: dayTrades.length,
        winRate,
      }
    })
  }, [trades])

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return <Smile className="w-6 h-6 text-green-400" />
      case 'stressed':
      case 'anxious':
      case 'angry':
        return <Frown className="w-6 h-6 text-red-400" />
      default:
        return <Meh className="w-6 h-6 text-gray-400" />
    }
  }

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy':
        return 'border-green-500/30 bg-green-500/10'
      case 'excited':
        return 'border-yellow-500/30 bg-yellow-500/10'
      case 'stressed':
      case 'anxious':
        return 'border-orange-500/30 bg-orange-500/10'
      case 'angry':
        return 'border-red-500/30 bg-red-500/10'
      default:
        return 'border-gray-700 bg-gray-800/50'
    }
  }

  // Ensure emotionalState is always defined and all values are valid numbers
  if (!emotionalState) {
    // Return default state if null
    emotionalState = {
      overall: 50,
      confidence: 50,
      discipline: 50,
      patience: 50,
      emotionalControl: 50,
      riskAwareness: 50,
      fear: 0,
      greed: 0,
      revenge: 0,
      overconfidence: 0,
      status: 'neutral' as const,
      recommendation: 'Not enough data to analyze emotional state.',
      insights: [],
    }
  } else {
    // Validate and fix any NaN values
    emotionalState = {
      ...emotionalState,
      overall: isNaN(emotionalState.overall) || !isFinite(emotionalState.overall) ? 50 : Math.max(0, Math.min(100, emotionalState.overall)),
      confidence: isNaN(emotionalState.confidence) || !isFinite(emotionalState.confidence) ? 50 : Math.max(0, Math.min(100, emotionalState.confidence)),
      discipline: isNaN(emotionalState.discipline) || !isFinite(emotionalState.discipline) ? 50 : Math.max(0, Math.min(100, emotionalState.discipline)),
      patience: isNaN(emotionalState.patience) || !isFinite(emotionalState.patience) ? 50 : Math.max(0, Math.min(100, emotionalState.patience)),
      emotionalControl: isNaN(emotionalState.emotionalControl) || !isFinite(emotionalState.emotionalControl) ? 50 : Math.max(0, Math.min(100, emotionalState.emotionalControl)),
      riskAwareness: isNaN(emotionalState.riskAwareness) || !isFinite(emotionalState.riskAwareness) ? 50 : Math.max(0, Math.min(100, emotionalState.riskAwareness)),
      fear: isNaN(emotionalState.fear) || !isFinite(emotionalState.fear) ? 0 : Math.max(0, Math.min(100, emotionalState.fear)),
      greed: isNaN(emotionalState.greed) || !isFinite(emotionalState.greed) ? 0 : Math.max(0, Math.min(100, emotionalState.greed)),
      revenge: isNaN(emotionalState.revenge) || !isFinite(emotionalState.revenge) ? 0 : Math.max(0, Math.min(100, emotionalState.revenge)),
      overconfidence: isNaN(emotionalState.overconfidence) || !isFinite(emotionalState.overconfidence) ? 0 : Math.max(0, Math.min(100, emotionalState.overconfidence)),
      insights: Array.isArray(emotionalState.insights) ? emotionalState.insights : [],
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl font-bold text-white">Emotional Patterns</h1>
          </div>
          <p className="text-gray-400">
            Track and optimize your emotional state for better trading performance
          </p>
        </div>

        {/* Emotional State Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Overall Score */}
          <Card variant="darker">
            <h2 className="text-lg font-semibold text-white mb-4">
              Overall Emotional Health
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(isNaN(emotionalState.overall) || !isFinite(emotionalState.overall) ? 50 : Math.max(0, Math.min(100, emotionalState.overall)) / 100) * 351.86} 351.86`}
                    className={
                      (isNaN(emotionalState.overall) || !isFinite(emotionalState.overall) ? 50 : emotionalState.overall) >= 70
                        ? 'text-green-400'
                        : (isNaN(emotionalState.overall) || !isFinite(emotionalState.overall) ? 50 : emotionalState.overall) >= 40
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {isNaN(emotionalState.overall) || !isFinite(emotionalState.overall) ? 50 : Math.round(emotionalState.overall)}
                    </div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Confidence</span>
                      <span className="text-sm font-semibold text-white">
                        {isNaN(emotionalState.confidence) || !isFinite(emotionalState.confidence) ? 50 : Math.round(emotionalState.confidence)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${isNaN(emotionalState.confidence) || !isFinite(emotionalState.confidence) ? 50 : Math.max(0, Math.min(100, emotionalState.confidence))}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Discipline</span>
                      <span className="text-sm font-semibold text-white">
                        {isNaN(emotionalState.discipline) || !isFinite(emotionalState.discipline) ? 50 : Math.round(emotionalState.discipline)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${isNaN(emotionalState.discipline) || !isFinite(emotionalState.discipline) ? 50 : Math.max(0, Math.min(100, emotionalState.discipline))}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Patience</span>
                      <span className="text-sm font-semibold text-white">
                        {isNaN(emotionalState.patience) || !isFinite(emotionalState.patience) ? 50 : Math.round(emotionalState.patience)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${isNaN(emotionalState.patience) || !isFinite(emotionalState.patience) ? 50 : Math.max(0, Math.min(100, emotionalState.patience))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-sm text-gray-300">{emotionalState.recommendation}</p>
            </div>
          </Card>

          {/* Negative Emotions */}
          <Card variant="darker">
            <h2 className="text-lg font-semibold text-white mb-4">Negative Emotions</h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Fear</span>
                  <span className="text-sm font-semibold text-yellow-400">
                    {isNaN(emotionalState.fear) || !isFinite(emotionalState.fear) ? 0 : Math.round(emotionalState.fear)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${isNaN(emotionalState.fear) || !isFinite(emotionalState.fear) ? 0 : Math.max(0, Math.min(100, emotionalState.fear))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Greed</span>
                  <span className="text-sm font-semibold text-orange-400">
                    {isNaN(emotionalState.greed) || !isFinite(emotionalState.greed) ? 0 : Math.round(emotionalState.greed)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${isNaN(emotionalState.greed) || !isFinite(emotionalState.greed) ? 0 : Math.max(0, Math.min(100, emotionalState.greed))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Revenge Trading</span>
                  <span className="text-sm font-semibold text-red-400">
                    {isNaN(emotionalState.revenge) || !isFinite(emotionalState.revenge) ? 0 : Math.round(emotionalState.revenge)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${isNaN(emotionalState.revenge) || !isFinite(emotionalState.revenge) ? 0 : Math.max(0, Math.min(100, emotionalState.revenge))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Overconfidence</span>
                  <span className="text-sm font-semibold text-purple-400">
                    {isNaN(emotionalState.overconfidence) || !isFinite(emotionalState.overconfidence) ? 0 : Math.round(emotionalState.overconfidence)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${isNaN(emotionalState.overconfidence) || !isFinite(emotionalState.overconfidence) ? 0 : Math.max(0, Math.min(100, emotionalState.overconfidence))}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        {emotionalState && emotionalState.insights && Array.isArray(emotionalState.insights) && emotionalState.insights.length > 0 && (
          <Card variant="darker" className="border-purple-500/30 bg-purple-500/10">
            <h2 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI-Powered Emotional Insights
            </h2>
            <ul className="space-y-2">
              {emotionalState.insights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Recent Emotion Entries */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Emotional Entries</h2>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Heart className="w-4 h-4" />
              Log Emotion
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <Card variant="darker" className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Entries Yet</h3>
              <p className="text-gray-400 mb-6">
                Start logging your emotions to track patterns
              </p>
              <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Log Your First Emotion
              </button>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <Card
                  key={entry.id}
                  variant="darker"
                  className={`border ${getEmotionColor(entry.emotion)}`}
                >
                  <div className="flex items-start gap-4">
                    {getEmotionIcon(entry.emotion)}

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white capitalize">
                            {entry.emotion}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {entry.beforeTrade ? 'Before Trade' : 'After Trade'}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-white mb-1">
                            {entry.intensity}/10
                          </div>
                          <p className="text-xs text-gray-500">
                            {format(entry.timestamp, 'PPp')}
                          </p>
                        </div>
                      </div>

                      {entry.notes && (
                        <p className="text-sm text-gray-300 mb-3">"{entry.notes}"</p>
                      )}

                      {entry.tradeOutcome && (
                        <div
                          className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                            entry.tradeOutcome === 'win'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          Trade Result: {entry.tradeOutcome === 'win' ? 'WIN' : 'LOSS'}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Emotional Trends */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Emotional Trends
          </h2>

          <Card variant="darker">
            <div className="space-y-4">
              {trends.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No trend data available yet</p>
              ) : (
                trends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-white">
                          {format(trend.date, 'PP')}
                        </p>
                        <p className="text-sm text-gray-400 capitalize">
                          Dominant: {trend.dominantEmotion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Intensity</p>
                        <p className="text-lg font-bold text-white">
                          {trend.averageIntensity.toFixed(1)}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-400">Trades</p>
                        <p className="text-lg font-bold text-white">{trend.tradeCount}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-400">Win Rate</p>
                        <p
                          className={`text-lg font-bold ${
                            trend.winRate >= 60 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {trend.winRate}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

