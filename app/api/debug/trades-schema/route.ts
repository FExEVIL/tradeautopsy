import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    const cookieStore = await cookies()
    const workosProfileId = cookieStore.get('workos_profile_id')?.value
    const activeProfileId = cookieStore.get('active_profile_id')?.value
    
    const effectiveUserId = activeProfileId || user?.id || workosProfileId

    // Get sample trade to see columns
    const { data: sample, error: sampleError } = await supabase
      .from('trades')
      .select('*')
      .limit(1)
      .maybeSingle()

    // Count total trades for user
    let count = 0
    let countError = null
    if (effectiveUserId) {
      const countResult = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', effectiveUserId)
      count = countResult.count || 0
      countError = countResult.error
    }

    // Get date range
    let dateRange = null
    let latestDate = null
    if (effectiveUserId) {
      const { data: earliest } = await supabase
        .from('trades')
        .select('trade_date, entry_date, date')
        .eq('user_id', effectiveUserId)
        .order('trade_date', { ascending: true })
        .limit(1)
        .maybeSingle()

      const { data: latest } = await supabase
        .from('trades')
        .select('trade_date, entry_date, date')
        .eq('user_id', effectiveUserId)
        .order('trade_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      dateRange = earliest
      latestDate = latest
    }

    return NextResponse.json({
      auth: {
        supabaseUserId: user?.id,
        workosProfileId,
        activeProfileId,
        effectiveUserId,
        authError: authError?.message
      },
      trades: {
        sampleColumns: sample ? Object.keys(sample) : [],
        sampleTrade: sample || null,
        totalCount: count,
        earliestDate: dateRange,
        latestDate: latestDate
      },
      errors: {
        sample: sampleError?.message,
        count: countError?.message
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

