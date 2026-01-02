import { BaseEmailTemplate } from './BaseTemplate'

export interface WeeklyReportData {
  userName: string
  weekStart: string
  weekEnd: string
  totalPnL: number
  winRate: number
  totalTrades: number
  bestTrade?: {
    symbol: string
    pnl: number
  }
  worstTrade?: {
    symbol: string
    pnl: number
  }
  rulesFollowed?: number
  rulesViolated?: number
  aiInsight?: string
  dashboardUrl: string
}

export function renderWeeklyReport(data: WeeklyReportData): string {
  const pnlColor = data.totalPnL >= 0 ? '#10b981' : '#ef4444'
  const pnlSign = data.totalPnL >= 0 ? '+' : ''
  
  return BaseEmailTemplate({
    title: `Your Weekly Trading Report - ${data.weekStart} to ${data.weekEnd}`,
    children: `
      <p style="margin: 0 0 20px 0;">Hi ${data.userName},</p>
      
      <p style="margin: 0 0 24px 0;">
        Here's your weekly trading performance summary:
      </p>
      
      <!-- Stats Grid -->
      <table role="presentation" style="width: 100%; margin: 0 0 24px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 16px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; text-align: center;">
            <div style="color: #9ca3af; font-size: 12px; font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Total P&L</div>
            <div style="color: ${pnlColor}; font-size: 24px; font-weight: 700;">${pnlSign}₹${Math.abs(data.totalPnL).toLocaleString('en-IN')}</div>
          </td>
          <td style="width: 12px;"></td>
          <td style="padding: 16px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; text-align: center;">
            <div style="color: #9ca3af; font-size: 12px; font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Win Rate</div>
            <div style="color: #ffffff; font-size: 24px; font-weight: 700;">${data.winRate}%</div>
          </td>
        </tr>
        <tr><td colspan="3" style="height: 12px;"></td></tr>
        <tr>
          <td style="padding: 16px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; text-align: center;">
            <div style="color: #9ca3af; font-size: 12px; font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Total Trades</div>
            <div style="color: #ffffff; font-size: 24px; font-weight: 700;">${data.totalTrades}</div>
          </td>
          <td style="width: 12px;"></td>
          <td style="padding: 16px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; text-align: center;">
            <div style="color: #9ca3af; font-size: 12px; font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Avg P&L/Trade</div>
            <div style="color: #ffffff; font-size: 24px; font-weight: 700;">₹${Math.round(data.totalPnL / data.totalTrades).toLocaleString('en-IN')}</div>
          </td>
        </tr>
      </table>
      
      ${data.bestTrade ? `
      <div style="margin: 0 0 16px 0; padding: 16px; background-color: #064e3b; border-left: 4px solid #10b981; border-radius: 4px;">
        <div style="color: #10b981; font-size: 14px; font-weight: 600; margin-bottom: 4px;">🏆 Best Trade</div>
        <div style="color: #d1d5db; font-size: 16px;">
          <strong>${data.bestTrade.symbol}</strong> - +₹${data.bestTrade.pnl.toLocaleString('en-IN')}
        </div>
      </div>
      ` : ''}
      
      ${data.worstTrade ? `
      <div style="margin: 0 0 24px 0; padding: 16px; background-color: #7f1d1d; border-left: 4px solid #ef4444; border-radius: 4px;">
        <div style="color: #ef4444; font-size: 14px; font-weight: 600; margin-bottom: 4px;">⚠️ Worst Trade</div>
        <div style="color: #d1d5db; font-size: 16px;">
          <strong>${data.worstTrade.symbol}</strong> - ₹${data.worstTrade.pnl.toLocaleString('en-IN')}
        </div>
      </div>
      ` : ''}
      
      ${data.rulesFollowed !== undefined && data.rulesViolated !== undefined ? `
      <div style="margin: 0 0 24px 0; padding: 16px; background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;">
        <div style="color: #ffffff; font-size: 16px; font-weight: 600; margin-bottom: 12px;">Trading Rules</div>
        <div style="color: #10b981; margin-bottom: 4px;">✅ ${data.rulesFollowed} rules followed</div>
        ${data.rulesViolated > 0 ? `<div style="color: #ef4444;">❌ ${data.rulesViolated} rules violated</div>` : '<div style="color: #9ca3af;">Perfect discipline this week! 🎉</div>'}
      </div>
      ` : ''}
      
      ${data.aiInsight ? `
      <div style="margin: 0 0 24px 0; padding: 16px; background-color: #1e3a5f; border-left: 4px solid #3b82f6; border-radius: 4px;">
        <div style="color: #3b82f6; font-size: 14px; font-weight: 600; margin-bottom: 8px;">🤖 AI Insight of the Week</div>
        <div style="color: #d1d5db; font-size: 15px; line-height: 1.6;">
          ${data.aiInsight}
        </div>
      </div>
      ` : ''}
      
      <p style="margin: 0;">
        Keep up the great work! Review your full dashboard for detailed analytics and insights.
      </p>
    `,
    cta: {
      label: 'View Full Dashboard',
      href: data.dashboardUrl,
    },
  })
}

