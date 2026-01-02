import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email-service'

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
    const { to, subject, html, type } = body

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    // Check email preferences if type is provided
    if (type) {
      const { data: preferences } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (preferences?.unsubscribe_all) {
        return NextResponse.json(
          { error: 'User has unsubscribed from all emails' },
          { status: 403 }
        )
      }

      // Check specific email type preference
      const typeMap: Record<string, keyof typeof preferences> = {
        welcome: 'welcome_email',
        weekly_report: 'weekly_report',
        goal_achieved: 'goal_achieved',
        inactivity_reminder: 'inactivity_reminder',
        daily_summary: 'daily_summary',
      }

      const preferenceKey = typeMap[type]
      if (preferenceKey && preferences && !preferences[preferenceKey]) {
        return NextResponse.json(
          { error: `User has disabled ${type} emails` },
          { status: 403 }
        )
      }
    }

    // Send email
    const success = await sendEmail({
      to,
      subject,
      html,
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Email Send] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    )
  }
}

