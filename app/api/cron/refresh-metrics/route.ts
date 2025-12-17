import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ✅ Edge runtime for fast cron execution
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  // ✅ Verify cron secret (Vercel sets this automatically)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ✅ Use service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    console.log('✅ Starting dashboard metrics refresh...')

    // ✅ Refresh materialized view (runs every 5 minutes via Vercel Cron)
    const { data, error } = await supabase.rpc('refresh_dashboard_metrics')

    if (error) {
      console.error('❌ Error refreshing dashboard metrics:', error)
      return NextResponse.json(
        { 
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      )
    }

    // ✅ Function returns JSONB with success/error info
    const result = data as { success: boolean; message?: string; error?: string; duration_ms?: number }
    
    if (result && result.success === false) {
      console.error('❌ Refresh function returned error:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Unknown error',
          message: result.message,
        },
        { status: 500 }
      )
    }

    console.log('✅ Dashboard metrics refreshed successfully:', result)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: result,
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    )
  }
}
