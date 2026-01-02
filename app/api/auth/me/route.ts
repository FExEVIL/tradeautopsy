import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()

    // Try to get user from Supabase auth
    const { data: { user }, error } = await supabase.auth.getUser()

    // Get WorkOS cookies
    const workosUserId = cookieStore.get('workos_user_id')?.value
    const workosProfileId = cookieStore.get('workos_profile_id')?.value
    const activeProfileId = cookieStore.get('active_profile_id')?.value

    // If we have a Supabase user
    if (user && !error) {
      // Look up profile to get linked account info
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_id, email, name, workos_user_id, profile_picture_url')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle()

      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || user.user_metadata?.full_name || null,
        avatar_url: profile?.profile_picture_url || user.user_metadata?.avatar_url || null,
        profile_id: profile?.id || null,
        effective_user_id: profile?.user_id || user.id,
        auth_method: 'supabase',
      })
    }

    // Fallback to WorkOS session
    if (workosUserId) {
      // Look up profile by workos_profile_id or workos_user_id
      const profileQuery = activeProfileId 
        ? supabase.from('profiles').select('*').eq('id', activeProfileId).maybeSingle()
        : supabase.from('profiles').select('*').eq('workos_user_id', workosUserId).maybeSingle()
      
      const { data: profile } = await profileQuery

      if (profile) {
        return NextResponse.json({
          id: profile.id,
          email: profile.email,
          name: profile.name || profile.email?.split('@')[0] || null,
          avatar_url: profile.profile_picture_url || null,
          profile_id: profile.id,
          effective_user_id: profile.user_id || profile.id,
          auth_method: 'workos',
          workos_user_id: workosUserId,
        })
      }

      // No profile found - return minimal info
      return NextResponse.json({
        id: workosUserId,
        email: null,
        name: null,
        avatar_url: null,
        profile_id: null,
        effective_user_id: workosUserId,
        auth_method: 'workos',
        needs_profile_setup: true,
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
