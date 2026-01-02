import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: preferences, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Return default preferences if none exist
    if (!preferences) {
      return NextResponse.json({
        welcome_email: true,
        weekly_report: true,
        goal_achieved: true,
        inactivity_reminder: true,
        daily_summary: false,
        weekly_report_day: 0,
        weekly_report_time: '18:00:00',
        daily_summary_time: '16:00:00',
        inactivity_days: 7,
        unsubscribe_all: false,
      })
    }

    return NextResponse.json(preferences)
  } catch (error: any) {
    console.error('[Email Preferences] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email preferences', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const { error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: user.id,
        ...body,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Email Preferences] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update email preferences', details: error.message },
      { status: 500 }
    )
  }
}

