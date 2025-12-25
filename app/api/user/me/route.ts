import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/user/me - SERVICE ROLE VERSION
 * 
 * Uses service role key to bypass RLS policies
 */
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getSession()

    console.log('[API /user/me SERVICE] Session:', session?.userId)

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create Supabase client with SERVICE ROLE key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,  // Service role key!
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('[API /user/me SERVICE] Querying with service role...')

    // Try to find profile by workos_user_id (most reliable)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('workos_user_id', session.workosUserId)
      .maybeSingle()

    console.log('[API /user/me SERVICE] Result:', { found: !!profile, error: error?.message })

    if (error) {
      console.error('[API /user/me SERVICE] Query error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    if (!profile) {
      console.error('[API /user/me SERVICE] Profile not found for:', session.workosUserId)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('[API /user/me SERVICE] ✅ Profile found:', profile.id)

    return NextResponse.json({
      user: {
        id: profile.id,
        userId: profile.user_id,
        workosUserId: profile.workos_user_id,
        name: profile.name,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        emailVerified: profile.email_verified,
        authProvider: profile.auth_provider,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      }
    })

  } catch (error) {
    console.error('[API /user/me SERVICE] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
