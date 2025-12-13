'use client'

import { useState } from 'react'
import { Brain, RefreshCw, Check, X, TrendingUp, AlertTriangle, Target, Loader2, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface MLInsight {
  id: string
  insight_type: string
  insight_text: string
  confidence_score: number
  metadata: Record<string, any>
  created_at: string
  acknowledged: boolean
}

interface MLInsightsClientProps {
  initialInsights: MLInsight[]
}

export default function MLInsightsClient({ initialInsights }: MLInsightsClientProps) {
  const [insights, setInsights] = useState<MLInsight[]>(initialInsights)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      let response: Response
      try {
        response = await fetch('/api/ml/insights')
      } catch (fetchError: any) {
        if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          alert('Network error. Please check your internet connection and try again.')
          return
        }
        throw fetchError
      }
      
      if (response.ok) {
        const data = await response.json()
        // Reload page to show new insights
        window.location.reload()
      } else {
        let errorMessage = 'Failed to generate insights'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      alert('Error generating insights. Please try again later.')
    } finally {
      setGenerating(false)
    }
  }

  const handleAcknowledge = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('ml_insights')
        .update({ acknowledged: true })
        .eq('id', insightId)

      if (error) throw error

      setInsights(insights.filter(i => i.id !== insightId))
    } catch (error) {
      console.error('Error acknowledging insight:', error)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'time_optimization':
        return Clock
      case 'strategy_recommendation':
        return Target
      case 'risk_adjustment':
        return AlertTriangle
      default:
        return Brain
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'time_optimization':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'strategy_recommendation':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      case 'risk_adjustment':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }


  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Personalized Insights
          </h1>
          <p className="text-gray-400 mt-1">AI-powered trading optimizations based on your data</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Generate Insights
            </>
          )}
        </button>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-12 bg-[#111111] border border-gray-800 rounded-xl">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No insights available</p>
          <p className="text-sm text-gray-500 mb-4">
            Generate personalized insights based on your trading patterns
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
          >
            Generate Insights
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.insight_type)
            return (
              <div
                key={insight.id}
                className={`p-6 bg-[#111111] border rounded-xl ${getInsightColor(insight.insight_type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {insight.insight_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(insight.confidence_score * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="text-white mb-3">{insight.insight_text}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(insight.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcknowledge(insight.id)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
