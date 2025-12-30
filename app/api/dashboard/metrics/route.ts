import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'

// ✅ Removed edge runtime - Supabase server client uses cookies() which requires Node.js runtime
// Edge runtime doesn't support cookies() from 'next/headers'
// Using Node.js runtime for compatibility with Supabase authentication
// export const runtime = 'edge' // ❌ Removed - incompatible with createClient() from @/utils/supabase/server

// ✅ Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Check WorkOS auth (fallback)
    const cookieHeader = request.headers.get('cookie') || ''
    const workosUserId = cookieHeader.match(/workos_user_id=([^;]+)/)?.[1]
    const workosProfileId = cookieHeader.match(/workos_profile_id=([^;]+)/)?.[1] || 
                            cookieHeader.match(/active_profile_id=([^;]+)/)?.[1]

    // Must have either Supabase user OR WorkOS session
    if ((authError || !user) && !workosUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use effective user ID for queries
    const effectiveUserId = user?.id || workosProfileId

    const searchParams = request.nextUrl.searchParams
    const profileParam = searchParams.get('profile_id')
    const profileId = profileParam || (effectiveUserId ? await getCurrentProfileId(effectiveUserId) : workosProfileId)
    
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // ✅ Query materialized view (instant response - fastest)
    const { data: metricsData, error: metricsError } = await supabase
      .from('dashboard_metrics_mv')
      .select('*')
      .eq('user_id', effectiveUserId)
      .maybeSingle()

    if (metricsError || !metricsData) {
      // Fallback to stored procedure if materialized view not available
      const { data: fallbackData, error: fallbackError } = await supabase.rpc(
        'get_user_metrics_fast',
        {
          p_user_id: effectiveUserId,
          p_profile_id: profileId || null,
          p_start_date: startDate || null,
          p_end_date: endDate || null,
        }
      )

      if (fallbackError) {
        // Final fallback to direct query
        const { data: trades } = await supabase
          .from('trades')
          .select('pnl')
          .eq('user_id', effectiveUserId)
          .is('deleted_at', null)
          .limit(1000)

        const totalPnL = trades?.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0) || 0
        const winCount = trades?.filter(t => Number(t.pnl) > 0).length || 0
        const totalTrades = trades?.length || 0

        return NextResponse.json(
          {
            total_pnl: totalPnL,
            total_trades: totalTrades,
            win_count: winCount,
            win_rate: totalTrades > 0 ? Math.round((winCount / totalTrades) * 100) : 0,
            avg_trade: totalTrades > 0 ? totalPnL / totalTrades : 0,
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
              'CDN-Cache-Control': 'public, s-maxage=60',
              'Vercel-CDN-Cache-Control': 'public, s-maxage=60',
            },
          }
        )
      }

      return NextResponse.json(fallbackData, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'CDN-Cache-Control': 'public, s-maxage=60',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=60',
        },
      })
    }

    // ✅ Return from materialized view (fastest path)
    return NextResponse.json(metricsData, {
      headers: {
        // ✅ Aggressive caching at CDN level
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'CDN-Cache-Control': 'public, s-maxage=60',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=60',
      },
    })
  } catch (error: any) {
    console.error('Dashboard metrics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}