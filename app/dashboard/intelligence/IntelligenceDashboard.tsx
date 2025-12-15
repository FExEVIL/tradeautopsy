"use client"

import { useState } from 'react'
import { useIntelligence } from '@/hooks/useIntelligence'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { PnLIndicator } from '@/components/PnLIndicator'

function QuickStats({ dashboard }: { dashboard: any }) {
  const qs = dashboard?.quickStats || {}
  return (
    <div className="grid-4">
      <StatCard
        label="TODAY P&L"
        value={<PnLIndicator value={qs.todayPnL || 0} variant="text" size="md" />}
        subtitle={`${qs.todayTrades || 0} trades`}
        icon="trendingUp"
        iconColor={qs.todayPnL >= 0 ? 'green' : 'red'}
        valueColor="auto"
        variant="darker"
      />
      <StatCard
        label="TODAY WIN RATE"
        value={`${Math.round((qs.todayWinRate || 0) * 100)}%`}
        subtitle="Win rate"
        icon="target"
        iconColor="blue"
        valueColor="white"
        variant="darker"
      />
      <StatCard
        label="WEEK P&L"
        value={<PnLIndicator value={qs.weekPnL || 0} variant="text" size="md" />}
        subtitle="Last 7 days"
        icon="barChart3"
        iconColor={qs.weekPnL >= 0 ? 'green' : 'red'}
        valueColor="auto"
        variant="darker"
      />
      <StatCard
        label="RISK SCORE"
        value={`${qs.riskScore || 0}/100`}
        subtitle="Higher = more risky"
        icon="shield"
        iconColor="red"
        valueColor="white"
        variant="darker"
      />
    </div>
  )
}

function PatternAlerts({ dashboard }: { dashboard: any }) {
  const patterns = dashboard?.activePatterns || []
  if (!patterns.length) {
    return (
      <Card variant="dark">
        <h3 className="text-lg font-semibold mb-2 text-white">Pattern Alerts</h3>
        <p className="text-sm text-gray-400">No active behavioral patterns detected. Keep trading disciplined.</p>
      </Card>
    )
  }

  return (
    <Card variant="dark">
      <h3 className="text-lg font-semibold mb-4 text-white">Pattern Alerts</h3>
      <div className="space-y-3">
        {patterns.map((p: any) => (
          <div key={p.id} className="p-3 rounded-lg bg-white/5 flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-white capitalize">{p.metadata?.patternName || p.type.replace(/_/g, ' ')}</div>
              <div className="text-xs text-gray-400 mt-1">
                Severity {p.severity}/10 • Confidence {(p.confidence * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-xs text-amber-400 font-mono">₹{Math.round(p.cost).toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function InsightsPanel({ insights }: { insights: any[] }) {
  if (!insights.length) {
    return (
      <Card variant="dark">
        <h3 className="text-lg font-semibold mb-2 text-white">Latest TAI Insights</h3>
        <p className="text-sm text-gray-400">No insights generated yet. Click "Generate Insights" to run analysis.</p>
      </Card>
    )
  }

  return (
    <Card variant="dark">
      <h3 className="text-lg font-semibold mb-4 text-white">Latest TAI Insights</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {insights.map((insight) => (
          <div key={insight.id} className="p-3 rounded-lg bg-white/5">
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  <span>{insight.title}</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">{insight.message}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                {insight.severity?.toUpperCase?.() || 'INFO'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function EmotionalStateCard({ state }: { state: any }) {
  if (!state) return null
  return (
    <Card variant="dark">
      <h3 className="text-lg font-semibold mb-2 text-white">Emotional State</h3>
      <p className="text-sm text-gray-300 capitalize">Current: {state.primary}</p>
      <p className="text-xs text-gray-400 mt-1">
        Intensity: {(state.intensity * 100).toFixed(0)}%
      </p>
      {state.triggers?.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">Triggers: {state.triggers.join(', ')}</p>
      )}
    </Card>
  )
}

function AchievementsBar({ dashboard }: { dashboard: any }) {
  const achievements = dashboard?.recentAchievements || []
  if (!achievements.length) {
    return (
      <Card variant="dark">
        <h3 className="text-lg font-semibold mb-2 text-white">Achievements</h3>
        <p className="text-sm text-gray-400">Unlock achievements as you trade consistently and follow your rules.</p>
      </Card>
    )
  }

  return (
    <Card variant="dark">
      <h3 className="text-lg font-semibold mb-4 text-white">Recent Achievements</h3>
      <div className="flex flex-wrap gap-3">
        {achievements.map((a: any) => (
          <div key={a.id} className="px-3 py-2 rounded-full bg-emerald-500/10 text-xs text-emerald-300 border border-emerald-500/30">
            {a.icon && <span className="mr-1">{a.icon}</span>}
            <span className="font-medium">{a.name}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function AICoachChat({ chatHistory, onSend }: { chatHistory: any[]; onSend: (msg: string) => Promise<void> }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    try {
      setSending(true)
      await onSend(input.trim())
      setInput('')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card variant="dark">
      <h3 className="text-lg font-semibold mb-4 text-white">TAI Coach</h3>
      <div className="flex flex-col h-80">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {chatHistory.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.role === 'assistant'
                  ? 'bg-emerald-500/10 text-emerald-100 self-start'
                  : 'bg-white/10 text-white self-end'
              }`}
            >
              {m.content}
            </div>
          ))}
          {chatHistory.length === 0 && (
            <p className="text-xs text-gray-500">Ask the coach about your performance, risk, or habits.</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            placeholder="Ask your TAI coach..."
          />
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-sm font-medium text-black disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </Card>
  )
}

export default function IntelligenceDashboard() {
  const { initialized, loading, error, dashboard, chatHistory, emotionalState, chat, generateInsights } =
    useIntelligence()
  const [insights, setInsights] = useState<any[]>([])

  const handleGenerateInsights = async () => {
    const list = await generateInsights()
    setInsights(list)
  }

  if (!initialized && loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        Loading TAI...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-red-400 text-sm">
        {error}
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        No TAI data available yet.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <QuickStats dashboard={dashboard} />

      <div className="grid-2">
        <PatternAlerts dashboard={dashboard} />
        <EmotionalStateCard state={emotionalState || dashboard.emotionalState} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">TAI Insights</h2>
        <button
          onClick={handleGenerateInsights}
          className="px-4 py-2 rounded-lg bg-emerald-500 text-black text-sm font-medium disabled:opacity-50"
        >
          Generate Insights
        </button>
      </div>
      <InsightsPanel insights={insights} />

      <div className="grid-2">
        <AchievementsBar dashboard={dashboard} />
        <AICoachChat chatHistory={chatHistory} onSend={chat} />
      </div>
    </div>
  )
}
