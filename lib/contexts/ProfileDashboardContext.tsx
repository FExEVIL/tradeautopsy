'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useProfile } from './ProfileContext'
import { applyTemplate, type DashboardWidget } from '@/lib/profile-templates'
import { getDefaultEnabledFeatures } from '@/lib/feature-flags'

export interface DashboardLayoutConfig {
  widgets: DashboardWidget[]
}

export interface ProfileDashboard {
  profileId: string
  layoutConfig: DashboardLayoutConfig
  enabledFeatures: string[]
  themeColor: string
  settings: {
    defaultChartType: string
    defaultTimeframe: string
    sidebarCollapsed: boolean
  }
}

interface ProfileDashboardContextType {
  currentDashboard: ProfileDashboard | null
  isLoading: boolean
  loadDashboard: (profileId: string) => Promise<void>
  updateLayout: (layout: DashboardLayoutConfig) => Promise<void>
  toggleFeature: (featureName: string) => Promise<void>
  updateSettings: (settings: Partial<ProfileDashboard['settings']>) => Promise<void>
  resetToDefault: () => Promise<void>
  applyTemplate: (templateId: string) => Promise<void>
}

const ProfileDashboardContext = createContext<ProfileDashboardContextType | null>(null)

export function ProfileDashboardProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const { activeProfile } = useProfile()
  const [currentDashboard, setCurrentDashboard] = useState<ProfileDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load dashboard when active profile changes
  useEffect(() => {
    if (activeProfile?.id) {
      loadDashboard(activeProfile.id)
    } else {
      setCurrentDashboard(null)
      setIsLoading(false)
    }
  }, [activeProfile?.id])

  const loadDashboard = useCallback(async (profileId: string) => {
    try {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // Load dashboard config
      const { data: dashboardData, error: dashboardError } = await supabase
        .from('profile_dashboards')
        .select('*')
        .eq('profile_id', profileId)
        .eq('user_id', user.id)
        .single()

      // Load features config
      const { data: featuresData, error: featuresError } = await supabase
        .from('profile_features')
        .select('*')
        .eq('profile_id', profileId)
        .eq('user_id', user.id)
        .single()

      // If dashboard doesn't exist, create default
      if (dashboardError && dashboardError.code === 'PGRST116') {
        // Create default dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('template_type, theme_color, color')
          .eq('id', profileId)
          .single()

        const templateId = (profile?.template_type as any) || 'custom'
        const templateConfig = applyTemplate(templateId)

        const { data: newDashboard } = await supabase
          .from('profile_dashboards')
          .insert({
            profile_id: profileId,
            user_id: user.id,
            layout_config: { widgets: templateConfig.dashboardWidgets },
            enabled_features: templateConfig.enabledFeatures,
            dashboard_widgets: templateConfig.dashboardWidgets,
            theme_color: profile?.theme_color || profile?.color || templateConfig.themeColor,
            default_chart_type: templateConfig.settings.defaultChartType,
            default_timeframe: templateConfig.settings.defaultTimeframe,
          })
          .select()
          .single()

        if (newDashboard) {
          const dashboard: ProfileDashboard = {
            profileId,
            layoutConfig: {
              widgets: (newDashboard.layout_config as any)?.widgets || newDashboard.dashboard_widgets || [],
            },
            enabledFeatures: (newDashboard.enabled_features as string[]) || [],
            themeColor: newDashboard.theme_color || '#3b82f6',
            settings: {
              defaultChartType: newDashboard.default_chart_type || 'line',
              defaultTimeframe: newDashboard.default_timeframe || '30D',
              sidebarCollapsed: newDashboard.sidebar_collapsed || false,
            },
          }
          setCurrentDashboard(dashboard)
          setIsLoading(false)
          return
        }
      }

      // If features doesn't exist, create default
      if (featuresError && featuresError.code === 'PGRST116') {
        await supabase
          .from('profile_features')
          .insert({
            profile_id: profileId,
            user_id: user.id,
          })
      }

      // Build dashboard from data
      if (dashboardData) {
        const dashboard: ProfileDashboard = {
          profileId,
          layoutConfig: {
            widgets: (dashboardData.layout_config as any)?.widgets || dashboardData.dashboard_widgets || [],
          },
          enabledFeatures: (dashboardData.enabled_features as string[]) || [],
          themeColor: dashboardData.theme_color || '#3b82f6',
          settings: {
            defaultChartType: dashboardData.default_chart_type || 'line',
            defaultTimeframe: dashboardData.default_timeframe || '30D',
            sidebarCollapsed: dashboardData.sidebar_collapsed || false,
          },
        }
        setCurrentDashboard(dashboard)
      } else {
        // Fallback to default
        const defaultFeatures = getDefaultEnabledFeatures()
        setCurrentDashboard({
          profileId,
          layoutConfig: { widgets: [] },
          enabledFeatures: defaultFeatures,
          themeColor: '#3b82f6',
          settings: {
            defaultChartType: 'line',
            defaultTimeframe: '30D',
            sidebarCollapsed: false,
          },
        })
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setCurrentDashboard(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const updateLayout = useCallback(async (layout: DashboardLayoutConfig) => {
    if (!activeProfile?.id || !currentDashboard) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profile_dashboards')
        .update({
          layout_config: layout,
          dashboard_widgets: layout.widgets,
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', activeProfile.id)
        .eq('user_id', user.id)

      if (error) throw error

      setCurrentDashboard({
        ...currentDashboard,
        layoutConfig: layout,
      })
    } catch (error) {
      console.error('Error updating layout:', error)
      throw error
    }
  }, [activeProfile?.id, currentDashboard, supabase])

  const toggleFeature = useCallback(async (featureName: string) => {
    if (!activeProfile?.id || !currentDashboard) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newFeatures = currentDashboard.enabledFeatures.includes(featureName)
        ? currentDashboard.enabledFeatures.filter(f => f !== featureName)
        : [...currentDashboard.enabledFeatures, featureName]

      const { error } = await supabase
        .from('profile_dashboards')
        .update({
          enabled_features: newFeatures,
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', activeProfile.id)
        .eq('user_id', user.id)

      if (error) throw error

      setCurrentDashboard({
        ...currentDashboard,
        enabledFeatures: newFeatures,
      })
    } catch (error) {
      console.error('Error toggling feature:', error)
      throw error
    }
  }, [activeProfile?.id, currentDashboard, supabase])

  const updateSettings = useCallback(async (settings: Partial<ProfileDashboard['settings']>) => {
    if (!activeProfile?.id || !currentDashboard) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profile_dashboards')
        .update({
          default_chart_type: settings.defaultChartType || currentDashboard.settings.defaultChartType,
          default_timeframe: settings.defaultTimeframe || currentDashboard.settings.defaultTimeframe,
          sidebar_collapsed: settings.sidebarCollapsed !== undefined 
            ? settings.sidebarCollapsed 
            : currentDashboard.settings.sidebarCollapsed,
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', activeProfile.id)
        .eq('user_id', user.id)

      if (error) throw error

      setCurrentDashboard({
        ...currentDashboard,
        settings: {
          ...currentDashboard.settings,
          ...settings,
        },
      })
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    }
  }, [activeProfile?.id, currentDashboard, supabase])

  const resetToDefault = useCallback(async () => {
    if (!activeProfile?.id) return

    const templateId = 'custom' // Default template
    await applyTemplateToProfile(templateId)
  }, [activeProfile?.id])

  const applyTemplateToProfile = useCallback(async (templateId: string) => {
    if (!activeProfile?.id) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const templateConfig = applyTemplate(templateId as any)

      const { error } = await supabase
        .from('profile_dashboards')
        .update({
          layout_config: { widgets: templateConfig.dashboardWidgets },
          enabled_features: templateConfig.enabledFeatures,
          dashboard_widgets: templateConfig.dashboardWidgets,
          theme_color: templateConfig.themeColor,
          default_chart_type: templateConfig.settings.defaultChartType,
          default_timeframe: templateConfig.settings.defaultTimeframe,
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', activeProfile.id)
        .eq('user_id', user.id)

      if (error) throw error

      // Reload dashboard
      await loadDashboard(activeProfile.id)
    } catch (error) {
      console.error('Error applying template:', error)
      throw error
    }
  }, [activeProfile?.id, loadDashboard, supabase])

  return (
    <ProfileDashboardContext.Provider
      value={{
        currentDashboard,
        isLoading,
        loadDashboard,
        updateLayout,
        toggleFeature,
        updateSettings,
        resetToDefault,
        applyTemplate: applyTemplateToProfile,
      }}
    >
      {children}
    </ProfileDashboardContext.Provider>
  )
}

export function useProfileDashboard() {
  const context = useContext(ProfileDashboardContext)
  if (!context) {
    throw new Error('useProfileDashboard must be used within ProfileDashboardProvider')
  }
  return context
}
