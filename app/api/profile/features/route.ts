import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/profile/features
 * Get enabled features for a profile
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

    // Get features config
    const { data: features, error: featuresError } = await supabase
      .from('profile_features')
      .select('*')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .single()

    if (featuresError && featuresError.code === 'PGRST116') {
      // Features don't exist, create default
      const { data: newFeatures, error: createError } = await supabase
        .from('profile_features')
        .insert({
          profile_id: profileId,
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      return NextResponse.json(newFeatures)
    }

    if (featuresError) {
      return NextResponse.json({ error: featuresError.message }, { status: 500 })
    }

    return NextResponse.json(features)
  } catch (error: any) {
    console.error('Error fetching features:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/profile/features
 * Toggle a feature on/off
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profileId, featureName, enabled } = body

    if (!profileId || !featureName) {
      return NextResponse.json({ error: 'profileId and featureName are required' }, { status: 400 })
    }

    // Map feature name to column name
    const columnMap: Record<string, string> = {
      'behavioral_analysis': 'show_behavioral_analysis',
      'ai_coach': 'show_ai_coach',
      'pattern_library': 'show_pattern_library',
      'risk_management': 'show_risk_management',
      'economic_calendar': 'show_economic_calendar',
      'comparisons': 'show_comparisons',
      'goals': 'show_goals',
      'strategy_analysis': 'show_strategy_analysis',
      'morning_brief': 'show_morning_brief',
      'audio_journal': 'enable_audio_journal',
      'predictive_alerts': 'enable_predictive_alerts',
      'ml_insights': 'enable_ml_insights',
    }

    const columnName = columnMap[featureName]
    if (!columnName) {
      return NextResponse.json({ error: 'Invalid feature name' }, { status: 400 })
    }

    // Update feature
    const updateData: any = {
      [columnName]: enabled !== undefined ? enabled : true,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('profile_features')
      .update(updateData)
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      // If doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: newFeatures, error: createError } = await supabase
          .from('profile_features')
          .insert({
            profile_id: profileId,
            user_id: user.id,
            [columnName]: enabled !== undefined ? enabled : true,
          })
          .select()
          .single()

        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }

        return NextResponse.json(newFeatures)
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating feature:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/profile/features
 * Bulk update features
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profileId, features } = body

    if (!profileId || !features) {
      return NextResponse.json({ error: 'profileId and features are required' }, { status: 400 })
    }

    // Update all features
    const { data, error } = await supabase
      .from('profile_features')
      .update({
        ...features,
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
    console.error('Error updating features:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
