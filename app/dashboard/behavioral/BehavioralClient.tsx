'use client'

import { BehavioralInsight } from '@/lib/behavioral-analyzer'

interface BehavioralClientProps {
  insights: BehavioralInsight[]
  trades: any[]
}

export default function BehavioralClient({ insights, trades }: BehavioralClientProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return (
          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'success':
        return (
          <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500/20'
      case 'warning': return 'border-yellow-500/20'
      case 'success': return 'border-emerald-500/20'
      default: return 'border-blue-500/20'
    }
  }

  return (
  <div className="bg-black p-8 pb-20">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Behavioral Analysis</h1>
        <p className="text-gray-400">AI-powered insights based on {trades.length} trades</p>
      </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Critical Issues</p>
            <p className="text-3xl font-bold text-red-400">
              {insights.filter(i => i.type === 'critical').length}
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Warnings</p>
            <p className="text-3xl font-bold text-yellow-400">
              {insights.filter(i => i.type === 'warning').length}
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Positive Patterns</p>
            <p className="text-3xl font-bold text-emerald-400">
              {insights.filter(i => i.type === 'success').length}
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Total Insights</p>
            <p className="text-3xl font-bold text-white">
              {insights.length}
            </p>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              className={`bg-neutral-900 rounded-xl p-6 border ${getBorderColor(insight.type)}`}
            >
              <div className="flex items-start gap-4">
                {getInsightIcon(insight.type)}
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{insight.title}</h3>
                  <p className="text-gray-300 mb-3">{insight.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 rounded-lg p-4">
                      <p className="text-gray-500 text-xs mb-1">Impact</p>
                      <p className="text-white font-medium">{insight.impact}</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-4">
                      <p className="text-gray-500 text-xs mb-1">Suggestion</p>
                      <p className="text-white font-medium">{insight.suggestion}</p>
                    </div>
                  </div>

                  {/* Show detailed data for revenge trading */}
                  {insight.data?.details && insight.data.details.length > 0 && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-2">Revenge Trade Details:</p>
                      <div className="space-y-2">
                        {insight.data.details.slice(0, 3).map((detail: any, i: number) => (
                          <div key={i} className="bg-black/60 rounded p-3 text-sm">
                            <span className="text-white">{detail.symbol}</span>
                            <span className="text-gray-500 mx-2">•</span>
                            <span className="text-yellow-400">{detail.minutesAfterLoss} min after loss</span>
                            <span className="text-gray-500 mx-2">•</span>
                            <span className={detail.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                              ₹{detail.pnl?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
