import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()

    // Try to get user from Supabase auth
    const { data: { user }, error } = await supabase.auth.getUser()

    if (user && !error) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      })
    }

    // Fallback to WorkOS cookies
    const workosUserId = cookieStore.get('workos_user_id')?.value
    const workosEmail = cookieStore.get('workos_email')?.value

    if (workosUserId) {
      return NextResponse.json({
        id: workosUserId,
        email: workosEmail || null,
        name: workosEmail?.split('@')[0] || null,
        avatar_url: null,
      })
    }

    // No authenticated user found
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )

  } catch (error) {
    console.error('[Auth/Me] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    )
  }
}

