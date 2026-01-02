import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email-service'
import { renderWelcomeEmail } from '@/lib/email/templates/WelcomeEmail'
import { renderWeeklyReport } from '@/lib/email/templates/WeeklyReport'
import { renderGoalAchievedEmail } from '@/lib/email/templates/GoalAchieved'
import { renderInactivityReminderEmail } from '@/lib/email/templates/InactivityReminder'
import { renderDailySummaryEmail } from '@/lib/email/templates/DailySummary'

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
    const { template, email } = body

    const testEmail = email || user.email
    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      )
    }

    // Get user name
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    const userName = profile?.name || user.email?.split('@')[0] || 'Trader'
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradeautopsy.com'}/dashboard`

    let html = ''
    let subject = ''

    switch (template) {
      case 'welcome':
        html = renderWelcomeEmail({ userName, dashboardUrl })
        subject = 'Welcome to TradeAutopsy! 🎯'
        break

      case 'weekly_report':
        html = renderWeeklyReport({
          userName,
          weekStart: 'Dec 25',
          weekEnd: 'Dec 31, 2024',
          totalPnL: 12500,
          winRate: 65,
          totalTrades: 20,
          bestTrade: { symbol: 'NIFTY', pnl: 3500 },
          worstTrade: { symbol: 'BANKNIFTY', pnl: -1200 },
          rulesFollowed: 18,
          rulesViolated: 2,
          aiInsight: 'Your win rate improved by 5% this week. Consider focusing on your best-performing time slots.',
          dashboardUrl,
        })
        subject = 'Your Weekly Trading Report - Dec 25 to Dec 31, 2024'
        break

      case 'goal_achieved':
        html = renderGoalAchievedEmail({
          userName,
          goalTitle: 'Monthly Profit Target',
          goalType: 'profit',
          targetValue: 50000,
          currentValue: 52500,
          progress: 105,
          dashboardUrl,
        })
        subject = '🎉 Goal Achieved: Monthly Profit Target'
        break

      case 'inactivity_reminder':
        html = renderInactivityReminderEmail({
          userName,
          daysSinceLastLogin: 7,
          totalTrades: 45,
          lastLoginDate: 'Dec 25, 2024',
          dashboardUrl,
        })
        subject = 'We miss you! Your trading journal awaits'
        break

      case 'daily_summary':
        html = renderDailySummaryEmail({
          userName,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          totalPnL: 2450,
          totalTrades: 3,
          winRate: 66,
          rulesStatus: {
            followed: 3,
            violated: 0,
          },
          tomorrowFocus: 'Focus on maintaining discipline and following your trading plan.',
          dashboardUrl,
        })
        subject = `Today's Trading Summary - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid template. Use: welcome, weekly_report, goal_achieved, inactivity_reminder, daily_summary' },
          { status: 400 }
        )
    }

    const success = await sendEmail({
      to: testEmail,
      subject,
      html,
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send email. Check email service configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test ${template} email sent to ${testEmail}`,
      template,
    })
  } catch (error: any) {
    console.error('[Test Email] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email', details: error.message },
      { status: 500 }
    )
  }
}

