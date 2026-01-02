import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email-service'
import { renderWelcomeEmail } from '@/lib/email/templates/WelcomeEmail'

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

    // Check if welcome email should be sent
    const { data: preferences } = await supabase
      .from('email_preferences')
      .select('welcome_email, unsubscribe_all')
      .eq('user_id', user.id)
      .single()

    if (preferences?.unsubscribe_all || preferences?.welcome_email === false) {
      return NextResponse.json({ message: 'Welcome email disabled by user preferences' })
    }

    // Get user name
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    const userName = profile?.name || user.email?.split('@')[0] || 'Trader'

    // Render and send email
    const html = renderWelcomeEmail({
      userName,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradeautopsy.com'}/dashboard`,
    })

    const success = await sendEmail({
      to: user.email!,
      subject: 'Welcome to TradeAutopsy! 🎯',
      html,
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Welcome Email] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email', details: error.message },
      { status: 500 }
    )
  }
}

