'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'

const templates = [
  { id: 'welcome', name: 'Welcome Email', description: 'Sent when user first signs up' },
  { id: 'weekly_report', name: 'Weekly Report', description: 'Weekly performance summary' },
  { id: 'goal_achieved', name: 'Goal Achieved', description: 'When a trading goal is completed' },
  { id: 'inactivity_reminder', name: 'Inactivity Reminder', description: 'Reminder after days of inactivity' },
  { id: 'daily_summary', name: 'Daily Summary', description: 'Daily trading summary' },
]

export default function TestEmailPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('welcome')
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendTest = async () => {
    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          email: testEmail || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }

      setResult({
        success: true,
        message: data.message || 'Test email sent successfully!',
      })
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to send test email',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <PageLayout title="Test Email Templates">
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">Test Email Templates</h3>
              <p className="text-gray-400 text-sm">
                Send test emails to verify your email templates are working correctly. Make sure you've configured your email provider (Resend/SendGrid) in environment variables.
              </p>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Select Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 text-left rounded-lg border transition-colors ${
                  selectedTemplate === template.id
                    ? 'bg-emerald-500/20 border-emerald-500'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Mail className={`w-4 h-4 ${selectedTemplate === template.id ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span className={`font-medium ${selectedTemplate === template.id ? 'text-emerald-400' : 'text-white'}`}>
                    {template.name}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Test Email Address (optional)
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Leave empty to use your account email"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <p className="text-xs text-gray-500">
            If left empty, the email will be sent to your account email address
          </p>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendTest}
          disabled={sending}
          className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Test Email
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className={`p-4 rounded-lg border flex items-start gap-3 ${
            result.success
              ? 'bg-emerald-500/20 border-emerald-500/30'
              : 'bg-red-500/20 border-red-500/30'
          }`}>
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.success ? 'Success!' : 'Error'}
              </p>
              <p className="text-sm text-gray-300 mt-1">{result.message}</p>
            </div>
          </div>
        )}

        {/* Configuration Help */}
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <h3 className="text-white font-medium mb-2">Email Configuration</h3>
          <p className="text-gray-400 text-sm mb-3">
            To enable email sending, add these to your <code className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">.env.local</code>:
          </p>
          <div className="space-y-2 text-xs font-mono text-gray-300 bg-black p-3 rounded">
            <div>EMAIL_SERVICE_PROVIDER=resend</div>
            <div>RESEND_API_KEY=your_resend_api_key</div>
            <div>EMAIL_FROM=TradeAutopsy &lt;noreply@tradeautopsy.com&gt;</div>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Get your Resend API key from{' '}
            <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
              resend.com/api-keys
            </a>
          </p>
        </div>
      </div>
    </PageLayout>
  )
}

