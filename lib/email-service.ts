/**
 * Email service for sending reports
 * Configure with environment variables:
 * - EMAIL_SERVICE_PROVIDER: 'resend' | 'sendgrid' | 'smtp' | 'none'
 * - RESEND_API_KEY: API key for Resend
 * - SENDGRID_API_KEY: API key for SendGrid
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: For SMTP
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const provider = process.env.EMAIL_SERVICE_PROVIDER || 'none'

  if (provider === 'none') {
    console.log('Email service not configured. Email would be sent to:', options.to)
    console.log('Subject:', options.subject)
    return false
  }

  try {
    switch (provider) {
      case 'resend':
        return await sendViaResend(options)
      case 'sendgrid':
        return await sendViaSendGrid(options)
      case 'smtp':
        return await sendViaSMTP(options)
      default:
        console.error('Unknown email provider:', provider)
        return false
    }
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

async function sendViaResend(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY not configured')
    return false
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'TradeAutopsy <reports@tradeautopsy.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: typeof att.content === 'string' 
          ? Buffer.from(att.content).toString('base64')
          : att.content.toString('base64'),
        content_type: att.contentType
      }))
    })
  })

  return response.ok
}

async function sendViaSendGrid(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    console.error('SENDGRID_API_KEY not configured')
    return false
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.to }] }],
      from: { email: process.env.EMAIL_FROM || 'reports@tradeautopsy.com' },
      subject: options.subject,
      content: [{ type: 'text/html', value: options.html }],
      attachments: options.attachments?.map(att => ({
        content: typeof att.content === 'string'
          ? Buffer.from(att.content).toString('base64')
          : att.content.toString('base64'),
        filename: att.filename,
        type: att.contentType || 'application/octet-stream',
        disposition: 'attachment'
      }))
    })
  })

  return response.ok
}

async function sendViaSMTP(options: EmailOptions): Promise<boolean> {
  // For SMTP, you would use a library like nodemailer
  // This is a placeholder - implement with nodemailer if needed
  console.log('SMTP email sending not yet implemented')
  console.log('Would send email to:', options.to)
  return false
}

export async function sendReportEmail(
  email: string,
  reportType: string,
  startDate: string,
  endDate: string,
  reportBlob: Blob,
  format: 'pdf' | 'csv'
): Promise<boolean> {
  const subject = `TradeAutopsy ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${startDate} to ${endDate}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 TradeAutopsy Report</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your ${reportType} trading report for the period <strong>${startDate}</strong> to <strong>${endDate}</strong> is ready.</p>
            <p>The report is attached to this email in ${format.toUpperCase()} format.</p>
            <p>Keep tracking your trades and improving your performance!</p>
            <p>Best regards,<br>The TradeAutopsy Team</p>
          </div>
        </div>
      </body>
    </html>
  `

  // Convert blob to base64 for email attachment
  const arrayBuffer = await reportBlob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64Content = buffer.toString('base64')

  return await sendEmail({
    to: email,
    subject,
    html,
    attachments: [{
      filename: `TradeAutopsy-Report-${startDate}-to-${endDate}.${format}`,
      content: base64Content,
      contentType: format === 'pdf' ? 'application/pdf' : 'text/csv'
    }]
  })
}
