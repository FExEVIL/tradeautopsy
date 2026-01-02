import { BaseEmailTemplate } from './BaseTemplate'

export interface DailySummaryData {
  userName: string
  date: string
  totalPnL: number
  totalTrades: number
  winRate: number
  rulesStatus?: {
    followed: number
    violated: number
  }
  tomorrowFocus?: string
  dashboardUrl: string
}

export function renderDailySummaryEmail(data: DailySummaryData): string {
  const pnlColor = data.totalPnL >= 0 ? '#10b981' : '#ef4444'
  const pnlSign = data.totalPnL >= 0 ? '+' : ''
  
  return BaseEmailTemplate({
    title: `Today's Trading Summary - ${data.date}`,
    children: `
      <p style="margin: 0 0 20px 0;">Hi ${data.userName},</p>
      
      <p style="margin: 0 0 24px 0;">
        Here's a quick summary of your trading day:
      </p>
      
      <!-- Today's Stats -->
      <table role="presentation" style="width: 100%; margin: 0 0 24px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; text-align: center;">
            <div style="color: #9ca3af; font-size: 12px; font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Today's P&L</div>
            <div style="color: ${pnlColor}; font-size: 32px; font-weight: 700; margin-bottom: 4px;">${pnlSign}₹${Math.abs(data.totalPnL).toLocaleString('en-IN')}</div>
          </td>
        </tr>
        <tr><td style="height: 12px;"></td></tr>
        <tr>
          <td style="padding: 16px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="text-align: center; padding: 0 8px;">
                  <div style="color: #9ca3af; font-size: 12px; font-weight: 500; margin-bottom: 4px;">Trades</div>
                  <div style="color: #ffffff; font-size: 20px; font-weight: 600;">${data.totalTrades}</div>
                </td>
                <td style="width: 1px; background-color: #2a2a2a;"></td>
                <td style="text-align: center; padding: 0 8px;">
                  <div style="color: #9ca3af; font-size: 12px; font-weight: 500; margin-bottom: 4px;">Win Rate</div>
                  <div style="color: #ffffff; font-size: 20px; font-weight: 600;">${data.winRate}%</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      
      ${data.rulesStatus ? `
      <div style="margin: 0 0 24px 0; padding: 16px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;">
        <div style="color: #ffffff; font-size: 16px; font-weight: 600; margin-bottom: 12px;">Trading Rules Status</div>
        <div style="color: #10b981; margin-bottom: 4px;">✅ ${data.rulesStatus.followed} rules followed</div>
        ${data.rulesStatus.violated > 0 ? `<div style="color: #ef4444;">❌ ${data.rulesStatus.violated} rules violated</div>` : '<div style="color: #9ca3af;">Perfect discipline today! 🎉</div>'}
      </div>
      ` : ''}
      
      ${data.tomorrowFocus ? `
      <div style="margin: 0 0 24px 0; padding: 16px; background-color: #1e3a5f; border-left: 4px solid #3b82f6; border-radius: 4px;">
        <div style="color: #3b82f6; font-size: 14px; font-weight: 600; margin-bottom: 8px;">🎯 Tomorrow's Focus</div>
        <div style="color: #d1d5db; font-size: 15px; line-height: 1.6;">
          ${data.tomorrowFocus}
        </div>
      </div>
      ` : ''}
      
      <p style="margin: 0;">
        Review your full dashboard for detailed analytics and plan tomorrow's trading session.
      </p>
    `,
    cta: {
      label: 'View Dashboard',
      href: data.dashboardUrl,
    },
  })
}

