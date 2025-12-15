"use client"

import { useCallback, useEffect, useState } from 'react'

interface IntelligenceDashboardResponse {
  dashboard: any
  chatHistory: any[]
  emotionalState: any
}

interface UseIntelligenceOptions {
  profileId?: string
}

export function useIntelligence(options: UseIntelligenceOptions = {}) {
  const { profileId } = options

  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<any | null>(null)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [emotionalState, setEmotionalState] = useState<any | null>(null)

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (profileId) params.set('profile_id', profileId)

      const res = await fetch(`/api/intelligence/dashboard?${params.toString()}`, {
        method: 'GET',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load intelligence dashboard')
      }

      const data: IntelligenceDashboardResponse = await res.json()
      setDashboard(data.dashboard)
      setChatHistory(data.chatHistory || [])
      setEmotionalState(data.emotionalState || null)
      setInitialized(true)
    } catch (err: any) {
      console.error('[useIntelligence] loadDashboard error:', err)
      setError(err.message || 'Failed to load intelligence dashboard')
    } finally {
      setLoading(false)
    }
  }, [profileId])

  const chat = useCallback(
    async (message: string) => {
      try {
        setError(null)
        const res = await fetch('/api/intelligence/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, profile_id: profileId }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to send message')
        }

        const data = await res.json()
        const assistantMessage = data.message

        setChatHistory((prev) => [
          ...prev,
          {
            id: `local-${Date.now()}-user`,
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          },
          assistantMessage,
        ])

        return assistantMessage
      } catch (err: any) {
        console.error('[useIntelligence] chat error:', err)
        setError(err.message || 'Failed to send message')
        throw err
      }
    },
    [profileId],
  )

  const generateInsights = useCallback(async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (profileId) params.set('profile_id', profileId)

      const res = await fetch(`/api/intelligence/insights?${params.toString()}`, {
        method: 'GET',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate insights')
      }

      const data = await res.json()
      return data.insights || []
    } catch (err: any) {
      console.error('[useIntelligence] generateInsights error:', err)
      setError(err.message || 'Failed to generate insights')
      throw err
    }
  }, [profileId])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  return {
    initialized,
    loading,
    error,
    dashboard,
    chatHistory,
    emotionalState,
    reload: loadDashboard,
    chat,
    generateInsights,
  }
}
