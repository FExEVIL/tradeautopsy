import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email-service'
import { renderGoalAchievedEmail } from '@/lib/email/templates/GoalAchieved'

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
    const { goalId } = body

    if (!goalId) {
      return NextResponse.json(
        { error: 'Missing goalId' },
        { status: 400 }
      )
    }

    // Get goal details
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (goalError || !goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    // Check if goal achieved email should be sent
    const { data: preferences } = await supabase
      .from('email_preferences')
      .select('goal_achieved, unsubscribe_all')
      .eq('user_id', user.id)
      .single()

    if (preferences?.unsubscribe_all || preferences?.goal_achieved === false) {
      return NextResponse.json({ message: 'Goal achieved email disabled by user preferences' })
    }

    // Get user name
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    const userName = profile?.name || user.email?.split('@')[0] || 'Trader'

    const targetValue = Number(goal.target_value) || 0
    const currentValue = Number(goal.current_value) || 0
    const progress = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0

    // Render and send email
    const html = renderGoalAchievedEmail({
      userName,
      goalTitle: goal.title,
      goalType: goal.goal_type,
      targetValue,
      currentValue,
      progress,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradeautopsy.com'}/dashboard`,
    })

    const success = await sendEmail({
      to: user.email!,
      subject: `🎉 Goal Achieved: ${goal.title}`,
      html,
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send goal achieved email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Goal Achieved Email] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send goal achieved email', details: error.message },
      { status: 500 }
    )
  }
}

