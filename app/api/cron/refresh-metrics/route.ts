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
    // ✅ Refresh materialized view (runs every 5 minutes via Vercel Cron)
    const { error } = await supabase.rpc('refresh_dashboard_metrics')

    if (error) {
      console.error('Error refreshing dashboard metrics:', error)
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Dashboard metrics refreshed successfully',
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    )
  }
}
