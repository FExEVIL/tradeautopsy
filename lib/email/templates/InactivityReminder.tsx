import { BaseEmailTemplate } from './BaseTemplate'

export interface InactivityReminderData {
  userName: string
  daysSinceLastLogin: number
  totalTrades?: number
  lastLoginDate?: string
  dashboardUrl: string
}

export function renderInactivityReminderEmail(data: InactivityReminderData): string {
  return BaseEmailTemplate({
    title: 'We miss you! Your trading journal awaits',
    children: `
      <p style="margin: 0 0 20px 0;">Hi ${data.userName},</p>
      
      <p style="margin: 0 0 20px 0;">
        It's been ${data.daysSinceLastLogin} ${data.daysSinceLastLogin === 1 ? 'day' : 'days'} since you last logged in. We wanted to check in and see how your trading journey is going!
      </p>
      
      ${data.totalTrades ? `
      <div style="margin: 0 0 24px 0; padding: 20px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;">
        <div style="color: #ffffff; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Your Progress</div>
        <div style="color: #d1d5db; font-size: 16px;">
          You've recorded <strong style="color: #10b981;">${data.totalTrades} trades</strong> so far.
        </div>
        ${data.lastLoginDate ? `
        <div style="color: #9ca3af; font-size: 14px; margin-top: 8px;">
          Last active: ${data.lastLoginDate}
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      <p style="margin: 0 0 20px 0;">
        <strong>What you're missing:</strong>
      </p>
      
      <ul style="margin: 0 0 20px 0; padding-left: 24px; color: #d1d5db;">
        <li style="margin-bottom: 12px;">📊 Track your trading performance and identify patterns</li>
        <li style="margin-bottom: 12px;">🤖 Get AI-powered insights about your trading behavior</li>
        <li style="margin-bottom: 12px;">📈 Monitor your progress toward your goals</li>
        <li style="margin-bottom: 12px;">📝 Document your trades and learnings in your journal</li>
        <li style="margin-bottom: 12px;">🎯 Stay disciplined with trading rules and checklists</li>
      </ul>
      
      <p style="margin: 0;">
        Your trading journal is waiting for you. Come back and continue your journey to better trading performance!
      </p>
    `,
    cta: {
      label: 'Login to Dashboard',
      href: data.dashboardUrl,
    },
    footerText: "We're here to help you succeed!<br>The TradeAutopsy Team",
  })
}

