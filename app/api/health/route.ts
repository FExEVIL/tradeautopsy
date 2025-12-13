import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {}
  let overallHealthy = true

  // Check Supabase connection
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('trades').select('id').limit(1)
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows (expected if no trades)
      checks.supabase = { status: 'error', message: error.message }
      overallHealthy = false
    } else {
      checks.supabase = { status: 'ok' }
    }
  } catch (error: any) {
    checks.supabase = { status: 'error', message: error.message }
    overallHealthy = false
  }

  // Check required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missingEnvVars: string[] = []
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar)
    }
  }

  if (missingEnvVars.length > 0) {
    checks.environment = {
      status: 'error',
      message: `Missing: ${missingEnvVars.join(', ')}`
    }
    overallHealthy = false
  } else {
    checks.environment = { status: 'ok' }
  }

  // Check optional services (don't fail health check if missing)
  if (process.env.OPENAI_API_KEY) {
    checks.openai = { status: 'ok' }
  } else {
    checks.openai = { status: 'ok', message: 'Not configured (optional)' }
  }

  if (process.env.EMAIL_SERVICE_PROVIDER && process.env.EMAIL_SERVICE_PROVIDER !== 'none') {
    const emailProvider = process.env.EMAIL_SERVICE_PROVIDER
    const hasApiKey = 
      (emailProvider === 'resend' && process.env.RESEND_API_KEY) ||
      (emailProvider === 'sendgrid' && process.env.SENDGRID_API_KEY) ||
      (emailProvider === 'smtp' && process.env.SMTP_HOST)
    
    if (hasApiKey) {
      checks.email = { status: 'ok' }
    } else {
      checks.email = { status: 'ok', message: 'Provider set but API key missing' }
    }
  } else {
    checks.email = { status: 'ok', message: 'Not configured (optional)' }
  }

  const statusCode = overallHealthy ? 200 : 503

  return NextResponse.json(
    {
      status: overallHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks
    },
    { status: statusCode }
  )
}
