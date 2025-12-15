import { NextRequest, NextResponse } from 'next/server'
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user already exists (Supabase will handle this, but we can check first)
    // Note: Supabase auth.signUp will return an error if email exists, so we can rely on that

    // Create user via Supabase Auth (for email/password)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
        data: {
          full_name: name,
        },
      },
    })

    if (authError || !authData.user) {
      console.error('[Signup] Auth error:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Failed to create account' },
        { status: 500 }
      )
    }

    // Create default profile (profiles table is for trading profiles, not user profiles)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        name: 'Default',
        description: 'Your main trading profile',
        type: 'equity',
        is_default: true,
        auth_provider: 'email',
        onboarding_completed: false,
        plan_type: 'hobby',
      })
      .select()
      .single()

    if (profileError) {
      console.error('[Signup] Profile error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    console.log('[Signup] User created successfully:', authData.user.id)

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
      },
      needsOnboarding: !profile.onboarding_completed,
    })

  } catch (error: any) {
    console.error('[Signup] Error:', error)
    return NextResponse.json(
      { error: `Failed to create account: ${error.message}` },
      { status: 500 }
    )
  }
}
