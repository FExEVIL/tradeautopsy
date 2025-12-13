import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { applyTemplate } from '@/lib/profile-templates'

/**
 * GET /api/profile/dashboard
 * Get dashboard configuration for a profile
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const profileId = searchParams.get('profileId')

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    }

    // Get dashboard config
    const { data: dashboard, error: dashboardError } = await supabase
      .from('profile_dashboards')
      .select('*')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .single()

    if (dashboardError && dashboardError.code === 'PGRST116') {
      // Dashboard doesn't exist, create default
      const { data: profile } = await supabase
        .from('profiles')
        .select('template_type, theme_color, color')
        .eq('id', profileId)
        .single()

      const templateId = (profile?.template_type as any) || 'custom'
      const templateConfig = applyTemplate(templateId)

      const { data: newDashboard, error: createError } = await supabase
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

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      return NextResponse.json(newDashboard)
    }

    if (dashboardError) {
      return NextResponse.json({ error: dashboardError.message }, { status: 500 })
    }

    return NextResponse.json(dashboard)
  } catch (error: any) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/profile/dashboard
 * Create or update dashboard configuration
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profileId, layoutConfig, enabledFeatures, themeColor, settings } = body

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    }

    // Check if dashboard exists
    const { data: existing } = await supabase
      .from('profile_dashboards')
      .select('id')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .single()

    const dashboardData: any = {
      profile_id: profileId,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    if (layoutConfig) {
      dashboardData.layout_config = layoutConfig
      dashboardData.dashboard_widgets = layoutConfig.widgets || []
    }

    if (enabledFeatures) {
      dashboardData.enabled_features = enabledFeatures
    }

    if (themeColor) {
      dashboardData.theme_color = themeColor
    }

    if (settings) {
      if (settings.defaultChartType) dashboardData.default_chart_type = settings.defaultChartType
      if (settings.defaultTimeframe) dashboardData.default_timeframe = settings.defaultTimeframe
      if (settings.sidebarCollapsed !== undefined) dashboardData.sidebar_collapsed = settings.sidebarCollapsed
    }

    let result
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('profile_dashboards')
        .update(dashboardData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('profile_dashboards')
        .insert(dashboardData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error saving dashboard:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/profile/dashboard
 * Update dashboard configuration
 */
export async function PUT(request: NextRequest) {
  return POST(request) // Same logic
}

/**
 * DELETE /api/profile/dashboard
 * Reset dashboard to default
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const profileId = searchParams.get('profileId')

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    }

    // Get profile template
    const { data: profile } = await supabase
      .from('profiles')
      .select('template_type, theme_color, color')
      .eq('id', profileId)
      .single()

    const templateId = (profile?.template_type as any) || 'custom'
    const templateConfig = applyTemplate(templateId)

    // Reset to default
    const { data, error } = await supabase
      .from('profile_dashboards')
      .update({
        layout_config: { widgets: templateConfig.dashboardWidgets },
        enabled_features: templateConfig.enabledFeatures,
        dashboard_widgets: templateConfig.dashboardWidgets,
        theme_color: profile?.theme_color || profile?.color || templateConfig.themeColor,
        default_chart_type: templateConfig.settings.defaultChartType,
        default_timeframe: templateConfig.settings.defaultTimeframe,
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error resetting dashboard:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
