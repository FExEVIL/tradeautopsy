'use client'

import { useState } from 'react'
import { BehavioralInsight } from '@/lib/behavioral-analyzer'
import type { Trade } from '@/types/trade'
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Target,
  Zap,
  ShieldAlert,
  Clock,
  Flame,
  X,
  ArrowRight
} from 'lucide-react'

type Props = {
  insights: BehavioralInsight[]
  trades: Trade[]
}

// --- MODAL COMPONENT ---
function TradeDrillDownModal({ 
  insight, 
  onClose 
}: { 
  insight: BehavioralInsight | null, 
  onClose: () => void 
}) {
  if (!insight) return null

  const details = insight.data?.details || insight.data?.highVolumeDays || insight.data?.hourlyData || []
  const isRevenge = insight.title.includes('Revenge')
  const isTime = insight.title.includes('Time') || insight.title.includes('Trading at')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="text-xl font-bold text-white">{insight.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{insight.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Contributing Events / Trades
          </h4>

          {Array.isArray(details) && details.length > 0 ? (
            <div className="space-y-2">
              {details.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/5 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${item.pnl > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item.symbol || item.hour || 'Trade Event'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isRevenge && `${item.minutesAfterLoss} min after loss`}
                        {isTime && `${item.trades} trades total`}
                        {!isRevenge && !isTime && 'Traceable event'}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-mono ${item.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.pnl ? (item.pnl > 0 ? '+' : '') + `₹${item.pnl}` : '-'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
              <p className="text-gray-500 text-sm">No specific trade details available for this pattern.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-white/5 bg-[#0A0A0A] rounded-b-2xl flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-emerald-200">
             <Zap className="w-4 h-4" />
             <span>{insight.suggestion}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- INSIGHT CARD COMPONENT ---
type InsightCardProps = {
  insight: BehavioralInsight
  onClick: (insight: BehavioralInsight) => void
}

function InsightCard({ insight, onClick }: InsightCardProps) {
  const config = {
    critical: {
      border: 'border-red-500/20',
      bg: 'bg-gradient-to-br from-red-500/5 to-red-900/10',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      Icon: AlertTriangle,
      fixColor: 'text-red-200',
    },
    warning: {
      border: 'border-amber-500/20',
      bg: 'bg-[#0A0A0A]',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      Icon: TrendingDown,
      fixColor: 'text-amber-200',
    },
    success: {
      border: 'border-green-500/20',
      bg: 'bg-[#0A0A0A]',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
      Icon: CheckCircle2,
      fixColor: 'text-green-200',
    },
    info: {
      border: 'border-emerald-500/20',
      bg: 'bg-[#0A0A0A]',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      Icon: Brain,
      fixColor: 'text-emerald-200',
    },
  }[insight.type]

  const { Icon } = config

  return (
    <button
      onClick={() => onClick(insight)}
      className={`
        group w-full text-left p-5 rounded-xl border transition-all
        ${config.border} ${config.bg}
        hover:border-white/20 hover:bg-white/5
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${config.iconBg}`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base group-hover:text-white transition-colors flex items-center gap-2 mb-1">
            {insight.title}
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all text-emerald-400" />
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">{insight.description}</p>
          <div className="mt-3">
            <p className={`text-xs ${config.fixColor} font-medium`}>
              {insight.suggestion}
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}

// --- MAIN CLIENT COMPONENT ---
export default function BehavioralClient({ insights = [], trades = [] }: Props) {
  const [selectedInsight, setSelectedInsight] = useState<BehavioralInsight | null>(null)

  const safeInsights = insights || []
  
  const critical = safeInsights.filter((i) => i.type === 'critical')
  const warnings = safeInsights.filter((i) => i.type === 'warning')
  const positive = safeInsights.filter((i) => i.type === 'success')
  const info = safeInsights.filter((i) => i.type === 'info')

  const totalInsights = safeInsights.length
  const negativeCount = critical.length * 2 + warnings.length
  const score = Math.max(0, 100 - negativeCount * 10)

  // Group insights into 3 sections
  const emotionalPatterns = safeInsights.filter(i => 
    i.title.toLowerCase().includes('fomo') ||
    i.title.toLowerCase().includes('revenge') ||
    i.title.toLowerCase().includes('overconfidence') ||
    i.title.toLowerCase().includes('fear') ||
    i.title.toLowerCase().includes('greed')
  )

  const disciplineExecution = safeInsights.filter(i =>
    i.title.toLowerCase().includes('plan') ||
    i.title.toLowerCase().includes('risk') ||
    i.title.toLowerCase().includes('stop') ||
    i.title.toLowerCase().includes('discipline') ||
    i.title.toLowerCase().includes('execution')
  )

  const timeContext = safeInsights.filter(i =>
    i.title.toLowerCase().includes('time') ||
    i.title.toLowerCase().includes('hour') ||
    i.title.toLowerCase().includes('day') ||
    i.title.toLowerCase().includes('week') ||
    i.title.toLowerCase().includes('pattern')
  )

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Behavioral Analysis
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              AI-powered insights based on {trades.length} trades. Click on any card to see the contributing trades.
            </p>
          </div>

          {/* Discipline Score */}
          <div className="flex items-center gap-4 bg-[#0A0A0A] border border-white/10 p-3 rounded-xl">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase">Discipline Score</p>
              <p className="text-2xl font-bold text-white">{score}</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold">{score}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Emotional Patterns */}
        {emotionalPatterns.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Emotional Patterns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emotionalPatterns.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} onClick={setSelectedInsight} />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Discipline & Execution */}
        {disciplineExecution.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
              Discipline & Execution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disciplineExecution.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} onClick={setSelectedInsight} />
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Time & Context */}
        {timeContext.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Time & Context
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeContext.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} onClick={setSelectedInsight} />
              ))}
            </div>
          </section>
        )}

        {/* Fallback: Show all insights if no grouping worked */}
        {emotionalPatterns.length === 0 && disciplineExecution.length === 0 && timeContext.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeInsights.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} onClick={setSelectedInsight} />
            ))}
          </div>
        )}

        {safeInsights.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No behavioral insights available yet.</p>
            <p className="text-sm text-gray-500 mt-2">Add more trades to generate insights.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <TradeDrillDownModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} />
    </div>
  )
}
