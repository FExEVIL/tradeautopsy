import { BaseEmailTemplate } from './BaseTemplate'

export interface WelcomeEmailData {
  userName: string
  dashboardUrl: string
}

export function renderWelcomeEmail(data: WelcomeEmailData): string {
  return BaseEmailTemplate({
    title: 'Welcome to TradeAutopsy! 🎯',
    children: `
      <p style="margin: 0 0 20px 0;">Hi ${data.userName},</p>
      
      <p style="margin: 0 0 20px 0;">
        We're thrilled to have you join TradeAutopsy! You're now part of a community of traders committed to improving their performance through data-driven insights.
      </p>
      
      <p style="margin: 0 0 20px 0;">
        <strong>Here's what you can do to get started:</strong>
      </p>
      
      <ul style="margin: 0 0 20px 0; padding-left: 24px; color: #d1d5db;">
        <li style="margin-bottom: 12px;">📊 <strong>Import your trades</strong> - Connect Zerodha, upload CSV, or add manually</li>
        <li style="margin-bottom: 12px;">🤖 <strong>Get AI insights</strong> - Discover patterns in your trading behavior</li>
        <li style="margin-bottom: 12px;">📈 <strong>Track performance</strong> - Monitor your P&L, win rate, and key metrics</li>
        <li style="margin-bottom: 12px;">🎯 <strong>Set goals</strong> - Define targets and track your progress</li>
        <li style="margin-bottom: 12px;">📝 <strong>Journal your trades</strong> - Document your thoughts and learnings</li>
      </ul>
      
      <p style="margin: 0 0 20px 0;">
        If you're new to trading journals, we recommend starting with our sample data to explore all features. You can always clear it later and import your real trades.
      </p>
      
      <p style="margin: 0;">
        Ready to transform your trading? Let's get started!
      </p>
    `,
    cta: {
      label: 'Go to Dashboard',
      href: data.dashboardUrl,
    },
    footerText: 'Happy Trading!<br>The TradeAutopsy Team',
  })
}

