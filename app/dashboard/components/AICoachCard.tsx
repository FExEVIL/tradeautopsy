'use client'

import { useEffect, useState } from 'react'
import { Bot, AlertTriangle, CheckCircle, X, MessageSquare } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface AIInsight {
  id: string
  title: string
  message: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  created_at: string
}

export function AICoachCard() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  async function fetchInsights() {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(3)

      // Handle 404 (table doesn't exist) gracefully
      if (error) {
        // PGRST205 = table not found in schema cache (table doesn't exist)
        // PGRST116 = relation does not exist
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('404') || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          // Silently handle missing table - user needs to run migration
          setInsights([])
          setLoading(false)
          return
        }
        console.error('Error fetching insights:', error)
      }

      setInsights(data || [])
    } catch (err: any) {
      // Handle network errors or other issues
      if (err?.code === 'PGRST205' || err?.code === 'PGRST116' ||
          err?.message?.includes('404') || 
          err?.message?.includes('Not Found') ||
          err?.message?.includes('schema cache')) {
        // Silently handle missing table
        setInsights([])
      } else {
        console.error('Error fetching insights:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  async function dismissInsight(id: string) {
    const supabase = createClient()
    await supabase
      .from('ai_insights')
      .update({ dismissed: true })
      .eq('id', id)

    setInsights(prev => prev.filter(i => i.id !== id))
  }

  const severityConfig = {
    critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    info: { icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' }
  }

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 animate-pulse h-64" />
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">AI Trading Coach</h3>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No new insights. Keep trading and I'll analyze your patterns!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map(insight => {
            const config = severityConfig[insight.severity]
            const Icon = config.icon

            return (
              <div
                key={insight.id}
                className={`p-4 rounded-lg ${config.bg} border ${config.border} relative`}
              >
                <button
                  onClick={() => dismissInsight(insight.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                  aria-label="Dismiss insight"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3 pr-6">
                  <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold ${config.color} mb-1 text-sm`}>{insight.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Link
        href="/dashboard/coach"
        className="w-full mt-4 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Chat with AI Coach
      </Link>
    </div>
  )
}

