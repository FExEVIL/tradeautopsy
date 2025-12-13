import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { applyTemplate, type TemplateType } from '@/lib/profile-templates'

/**
 * POST /api/profile/apply-template
 * Apply a template to a profile
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profileId, templateType } = body

    if (!profileId || !templateType) {
      return NextResponse.json({ error: 'profileId and templateType are required' }, { status: 400 })
    }

    // Validate template type
    const validTemplates: TemplateType[] = ['day_trader', 'swing_trader', 'options_trader', 'investor', 'custom']
    if (!validTemplates.includes(templateType as TemplateType)) {
      return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
    }

    // Get template config
    const templateConfig = applyTemplate(templateType as TemplateType)

    // Update profile with template type
    await supabase
      .from('profiles')
      .update({
        template_type: templateType,
        theme_color: templateConfig.themeColor,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)
      .eq('user_id', user.id)

    // Update or create dashboard config
    const { data: existing } = await supabase
      .from('profile_dashboards')
      .select('id')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .single()

    const dashboardData = {
      profile_id: profileId,
      user_id: user.id,
      layout_config: { widgets: templateConfig.dashboardWidgets },
      enabled_features: templateConfig.enabledFeatures,
      dashboard_widgets: templateConfig.dashboardWidgets,
      theme_color: templateConfig.themeColor,
      default_chart_type: templateConfig.settings.defaultChartType,
      default_timeframe: templateConfig.settings.defaultTimeframe,
      updated_at: new Date().toISOString(),
    }

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('profile_dashboards')
        .update(dashboardData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      const { data, error } = await supabase
        .from('profile_dashboards')
        .insert(dashboardData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      dashboard: result,
      template: templateConfig,
    })
  } catch (error: any) {
    console.error('Error applying template:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
