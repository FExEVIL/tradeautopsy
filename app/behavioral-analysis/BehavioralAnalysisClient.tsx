'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Clock,
  Heart,
  Zap,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmotionalState } from '@/lib/emotional-engine/calculator'
import { BehavioralInsight } from '@/lib/behavioral-analyzer'
import { DetectedPattern } from '@/lib/ai-coach'

interface BehavioralAnalysisClientProps {
  trades: any[]
  emotionalState: EmotionalState | null
  disciplineScore: number
  behavioralInsights: BehavioralInsight[]
  patterns: DetectedPattern[]
}

export function BehavioralAnalysisClient({
  trades,
  emotionalState,
  disciplineScore,
  behavioralInsights,
  patterns,
}: BehavioralAnalysisClientProps) {
  // Convert behavioral insights to metrics format
  const metrics = useMemo(() => {
    const metricsList: any[] = []

    // Revenge trading
    const revengeInsight = behavioralInsights.find(i => 
      i.title.toLowerCase().includes('revenge')
    )
    if (revengeInsight) {
      const revengePattern = patterns.find(p => p.type === 'revenge_trading')
      metricsList.push({
        id: '1',
        category: 'emotional',
        title: 'Revenge Trading Detected',
        value: `${revengePattern?.frequency || 0} trades`,
        trend: 'down',
        status: 'critical',
        description: revengeInsight.description,
        improvement: revengeInsight.suggestion,
      })
    }

    // Overtrading
    const overtradingInsight = behavioralInsights.find(i => 
      i.title.toLowerCase().includes('overtrading')
    )
    if (overtradingInsight) {
      const overtradingPattern = patterns.find(p => p.type === 'overtrading')
      metricsList.push({
        id: '2',
        category: 'timing',
        title: 'Overtrading Pattern',
        value: `${overtradingPattern?.frequency || 0} days`,
        trend: 'up',
        status: 'warning',
        description: overtradingInsight.description,
        improvement: overtradingInsight.suggestion,
      })
    }

    // Best trading time
    const timeInsight = behavioralInsights.find(i => 
      i.title.toLowerCase().includes('time') && i.type === 'success'
    )
    if (timeInsight) {
      // bestHour is an object with {hour, winRate, avgPnL, trades}
      const bestHour = timeInsight.data?.bestHour
      const hourDisplay = bestHour?.hour 
        ? typeof bestHour.hour === 'string' 
          ? bestHour.hour 
          : `${bestHour.hour}:00`
        : 'N/A'
      
      metricsList.push({
        id: '3',
        category: 'timing',
        title: 'Best Trading Time',
        value: hourDisplay,
        trend: 'neutral',
        status: 'good',
        description: timeInsight.description,
        improvement: timeInsight.suggestion,
      })
    }

    // Strategy consistency
    const consistencyInsight = behavioralInsights.find(i => 
      i.title.toLowerCase().includes('consistency') || 
      i.title.toLowerCase().includes('strategy')
    )
    if (consistencyInsight) {
      metricsList.push({
        id: '4',
        category: 'strategy',
        title: 'Strategy Consistency',
        value: '68%',
        trend: 'up',
        status: 'good',
        description: consistencyInsight.description,
        improvement: consistencyInsight.suggestion,
      })
    }

    return metricsList
  }, [behavioralInsights, patterns])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'border-green-500/30 bg-green-500/10'
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10'
      case 'critical':
        return 'border-red-500/30 bg-red-500/10'
      default:
        return 'border-gray-700 bg-gray-800/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Behavioral Analysis</h1>
          </div>
          <p className="text-gray-400">
            Understand your trading psychology and patterns
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 bg-bg-card border border-border-subtle rounded-lg p-1">
          <button className="flex-1 px-6 py-3 rounded-md font-medium transition-all bg-green-primary text-text-primary shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <Brain className="w-5 h-5" />
              <span>Pattern Detection</span>
            </div>
          </button>
          <Link
            href="/dashboard/behavioral"
            className="flex-1 px-6 py-3 rounded-md font-medium transition-all text-text-tertiary hover:text-text-primary hover:bg-border-subtle"
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>Pattern Library</span>
            </div>
          </Link>
          <Link
            href="/dashboard/mistakes"
            className="flex-1 px-6 py-3 rounded-md font-medium transition-all text-text-tertiary hover:text-text-primary hover:bg-border-subtle"
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Mistakes Dashboard</span>
            </div>
          </Link>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-400">
            AI-powered insights based on {trades.length} trades. Click on any card to see the contributing trades.
          </p>
        </div>

        {/* Discipline Score */}
        <div className="mb-8 flex justify-end">
          <Card variant="darker" className="p-6 w-fit">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase mb-1">Discipline Score</p>
                <p className="text-3xl font-bold text-white">{disciplineScore}</p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-green-500/30 flex items-center justify-center bg-green-500/10">
                <span className="text-green-400 font-bold text-2xl">{disciplineScore}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Emotional Patterns Section */}
        {emotionalState && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Emotional Patterns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Revenge Trading Card */}
              {emotionalState.revenge > 0 && (
                <Card variant="darker" className="border-red-500/30 bg-red-500/10">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Revenge Trading Detected
                      </h3>
                      <p className="text-gray-300 mb-3">
                        You took {Math.round((emotionalState.revenge / 100) * trades.length)} trades within 30 minutes of a loss
                      </p>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-300">
                          <strong className="text-green-400">Recommendation:</strong> Wait at least 1 hour after a loss before taking the next trade
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Overtrading Card */}
              {patterns.find(p => p.type === 'overtrading') && (
                <Card variant="darker" className="border-yellow-500/30 bg-yellow-500/10">
                  <div className="flex items-start gap-4">
                    <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Overtrading Pattern
                      </h3>
                      <p className="text-gray-300 mb-3">
                        You traded {patterns.find(p => p.type === 'overtrading')?.frequency || 0} times in a single day
                      </p>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-300">
                          <strong className="text-green-400">Recommendation:</strong> Limit yourself to 3-5 quality trades per day
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Best Trading Time */}
              {behavioralInsights.find(i => i.type === 'success' && i.title.includes('Time')) && (
                <Card variant="darker" className="border-green-500/30 bg-green-500/10">
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Best Trading Time
                      </h3>
                      <p className="text-gray-300 mb-3">
                        {behavioralInsights.find(i => i.type === 'success' && i.title.includes('Time'))?.description}
                      </p>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-300">
                          <strong className="text-green-400">Recommendation:</strong> Focus more trades during your optimal window
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {emotionalState && emotionalState.insights.length > 0 && (
          <Card variant="darker" className="border-purple-500/30 bg-purple-500/10 mb-8">
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

        {/* Behavioral Metrics Grid */}
        {metrics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Behavioral Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <Card
                  key={metric.id}
                  variant="darker"
                  className={`border ${getStatusColor(metric.status)}`}
                >
                  <div className="flex items-start gap-4">
                    {getStatusIcon(metric.status)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{metric.title}</h3>
                      <p className="text-2xl font-bold mb-2">{metric.value}</p>
                      <p className="text-sm text-gray-400 mb-3">{metric.description}</p>
                      {metric.improvement && (
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                          <p className="text-sm text-gray-300">
                            <strong className="text-green-400">Improvement:</strong> {metric.improvement}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {trades.length === 0 && (
          <Card variant="darker" className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Trading Data</h3>
            <p className="text-gray-400 mb-6">
              Import your trades to start analyzing behavioral patterns
            </p>
            <Link
              href="/dashboard/trades"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              <ArrowRight className="w-5 h-5" />
              Import Trades
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}

