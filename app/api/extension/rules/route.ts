import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Browser Extension API - Get Active Rules
 * Returns lightweight rule data for extension to validate trades
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get active rules (enabled only)
    const { data: rules, error } = await supabase
      .from('trading_rules')
      .select('id, rule_type, title, rule_config, severity')
      .eq('user_id', user.id)
      .eq('enabled', true)

    if (error) {
      console.error('Error fetching rules:', error)
      return NextResponse.json(
        { error: 'Failed to fetch rules', details: error.message },
        { status: 500 }
      )
    }

    // Return lightweight rule data (no sensitive info)
    return NextResponse.json({
      rules: (rules || []).map(rule => ({
        id: rule.id,
        type: rule.rule_type,
        title: rule.title,
        config: rule.rule_config,
        severity: rule.severity
      }))
    })
  } catch (error: any) {
    console.error('Extension rules API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rules', details: error.message },
      { status: 500 }
    )
  }
}
