'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Info, Ban, Clock, X, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'

interface Alert {
  id: string
  alert_type: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  confidence: number
  created_at: string
  helpful?: boolean | null
}

export function PredictiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()

    // Real-time subscription for new alerts (only if table exists)
    let channel: any = null
    try {
      const supabase = createClient()
      channel = supabase
        .channel('predictive_alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'predictive_alerts',
            filter: `dismissed=eq.false`
          },
          () => {
            fetchAlerts()
          }
        )
        .subscribe()
    } catch (err) {
      // Table might not exist yet, skip subscription silently
    }

    return () => {
      if (channel) {
        try {
          channel.unsubscribe()
        } catch (err) {
          // Ignore unsubscribe errors
        }
      }
    }
  }, [])

  async function fetchAlerts() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    try {
      const { data, error } = await supabase
        .from('predictive_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(5)

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
          setAlerts([])
          setLoading(false)
          return
        }
        console.error('Error fetching alerts:', error)
      }

      setAlerts(data || [])
    } catch (err: any) {
      // Handle network errors or other issues
      if (err?.code === 'PGRST205' || err?.code === 'PGRST116' ||
          err?.message?.includes('404') || 
          err?.message?.includes('Not Found') ||
          err?.message?.includes('schema cache')) {
        // Silently handle missing table
        setAlerts([])
      } else {
        console.error('Error fetching alerts:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  async function dismissAlert(id: string, action: 'heeded' | 'dismissed') {
    const supabase = createClient()

    await supabase
      .from('predictive_alerts')
      .update({
        dismissed: true,
        dismissed_at: new Date().toISOString(),
        user_action: action
      })
      .eq('id', id)

    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  async function provideFeedback(id: string, helpful: boolean) {
    const supabase = createClient()

    await supabase
      .from('predictive_alerts')
      .update({
        helpful,
        user_action: helpful ? 'heeded' : 'ignored'
      })
      .eq('id', id)

    setAlerts(prev => prev.map(a => a.id === id ? { ...a, helpful } : a))
  }

  const iconMap: Record<string, typeof AlertTriangle> = {
    tilt_warning: AlertTriangle,
    avoid_trading: Ban,
    best_time: Clock,
    take_break: Info
  }

  const colorMap = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: 'text-yellow-400'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'text-blue-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-[#0A0A0A] border border-white/5 animate-pulse h-24" />
      </div>
    )
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const Icon = iconMap[alert.alert_type] || Info
        const colors = colorMap[alert.severity] || colorMap.info

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${colors.bg} ${colors.border} relative transition-all hover:border-opacity-50`}
          >
            <button
              onClick={() => dismissAlert(alert.id, 'dismissed')}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${colors.text} mb-1 text-sm`}>{alert.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed mb-2">{alert.message}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <button
                    onClick={() => dismissAlert(alert.id, 'heeded')}
                    className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    Thanks, I'll take action
                  </button>
                  {alert.helpful === null || alert.helpful === undefined ? (
                    <>
                      <button
                        onClick={() => provideFeedback(alert.id, true)}
                        className="text-xs px-2 py-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors flex items-center gap-1"
                        title="This alert was helpful"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        Helpful
                      </button>
                      <button
                        onClick={() => provideFeedback(alert.id, false)}
                        className="text-xs px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-1"
                        title="This alert was not helpful"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        Not helpful
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert.helpful 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {alert.helpful ? '✓ Helpful' : '✗ Not helpful'}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 self-center">
                    {Math.round(alert.confidence * 100)}% confidence
                  </span>
                  <span className="text-xs text-gray-600 ml-auto">
                    {format(new Date(alert.created_at), 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

