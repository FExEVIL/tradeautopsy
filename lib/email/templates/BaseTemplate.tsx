/**
 * Base Email Template
 * Provides consistent styling and layout for all TradeAutopsy emails
 */

export interface BaseEmailTemplateProps {
  title: string
  children: React.ReactNode
  cta?: {
    label: string
    href: string
  }
  footerText?: string
}

export function BaseEmailTemplate({
  title,
  children,
  cta,
  footerText = 'Best regards,<br>The TradeAutopsy Team',
}: BaseEmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                TradeAutopsy
              </h1>
              <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px; font-weight: 500;">
                Your Trading Performance Companion
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 24px 0; color: #ffffff; font-size: 24px; font-weight: 600; line-height: 1.3;">
                ${title}
              </h2>
              
              <div style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
                ${children}
              </div>
              
              ${cta ? `
              <table role="presentation" style="margin: 32px 0 0 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${cta.href}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      ${cta.label}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #0f0f0f; border-top: 1px solid #1a1a1a;">
              <p style="margin: 0 0 12px 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                ${footerText}
              </p>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} TradeAutopsy. All rights reserved.
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tradeautopsy.com'}/settings/notifications" style="color: #10b981; text-decoration: none;">Manage email preferences</a> | 
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tradeautopsy.com'}/privacy" style="color: #10b981; text-decoration: none;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

