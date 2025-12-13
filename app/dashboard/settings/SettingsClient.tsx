'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'

interface SettingsContextType {
  preferences: any
  stats: any
  isSaving: boolean
  updatePreferences: (updates: any) => Promise<void>
  updateStats: (updates: any) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsClient({
  children,
  initialPreferences,
  initialStats
}: {
  children: ReactNode
  initialPreferences: any
  initialStats: any
}) {
  const supabase = createClient()
  const [preferences, setPreferences] = useState(initialPreferences || {})
  const [stats, setStats] = useState(initialStats || {})
  const [isSaving, setIsSaving] = useState(false)

  const updatePreferences = async (updates: any) => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: user.id, 
          ...preferences, 
          ...updates, 
          updated_at: new Date().toISOString() 
        }, {
          onConflict: 'user_id'
        })
      
      if (!error) {
        setPreferences({ ...preferences, ...updates })
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateStats = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('usage_stats')
        .upsert({ 
          user_id: user.id, 
          ...stats, 
          ...updates, 
          updated_at: new Date().toISOString() 
        }, {
          onConflict: 'user_id'
        })
      
      if (!error) {
        setStats({ ...stats, ...updates })
      }
    } catch (error) {
      console.error('Error updating stats:', error)
    }
  }

  return (
    <SettingsContext.Provider value={{
      preferences,
      stats,
      isSaving,
      updatePreferences,
      updateStats
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsClient')
  return context
}

