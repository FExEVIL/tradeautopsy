import { NextRequest, NextResponse } from 'next/server'
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos'
import { createClient } from '@/utils/supabase/server'
import { handleError } from '@/lib/utils/error-handler'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    if (!workos) {
      return NextResponse.json({ error: 'WorkOS not configured' }, { status: 500 })
    }

    // Create user with WorkOS
    const user = await workos.userManagement.createUser({
      email: email.toLowerCase().trim(),
      password,
      firstName: name?.split(' ')[0] || '',
      lastName: name?.split(' ').slice(1).join(' ') || '',
    })

    // Create profile in Supabase
    const supabase = await createClient()
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email: user.email,
        name: name || user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : email.split('@')[0],
        workos_user_id: user.id,
        auth_provider: 'workos',
        is_default: true,
        email_verified: user.emailVerified || false,
        profile_picture_url: user.profilePictureUrl,
      })
      .select('id')
      .single()

    if (profileError) {
      console.error('[Password Signup] Failed to create profile:', profileError)
      // Continue - profile can be created later
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully. You can now sign in.',
      userId: user.id,
      needsEmailVerification: !user.emailVerified,
    })
  } catch (error: any) {
    console.error('[Password Signup] Error:', error)
    const appError = handleError(error)
    
    // Provide user-friendly error messages
    let errorMessage = appError.message || 'Failed to create account'
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      errorMessage = 'An account with this email already exists'
    } else if (error.message?.includes('Invalid') || error.message?.includes('invalid')) {
      errorMessage = 'Invalid email or password format'
    }
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 400 })
  }
}

