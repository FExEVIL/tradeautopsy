import { NextRequest, NextResponse } from 'next/server'
import { workos } from '@/lib/workos'
import { createClient } from '@/utils/supabase/server'
import { createSession } from '@/lib/auth/session'

/**
 * POST /api/auth/verify-otp
 * 
 * Verifies OTP and creates session with CORRECT profile ID
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    if (!workos) {
      return NextResponse.json(
        { error: 'WorkOS not configured' },
        { status: 500 }
      )
    }

    console.log('[Verify OTP] Attempting authentication')

    // ========================================
    // STEP 1: Verify OTP with WorkOS
    // ========================================
    const authResponse = await workos.userManagement.authenticateWithMagicAuth({
      code,
      email,
      clientId: process.env.WORKOS_CLIENT_ID!,
    })

    console.log('[Verify OTP] WorkOS auth successful:', authResponse.user.id)

    // ========================================
    // STEP 2: Find existing profile by workos_user_id
    // ========================================
    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('workos_user_id', authResponse.user.id)
      .single()

    if (profileError || !profile) {
      console.error('[Verify OTP] Profile not found:', profileError)
      return NextResponse.json(
        { error: 'Profile not found. Please contact support.' },
        { status: 404 }
      )
    }

    console.log('[Verify OTP] Profile found:', profile.id)

    // ========================================
    // STEP 3: Create session with ACTUAL profile ID
    // ========================================
    await createSession({
      userId: profile.id,  // Use the actual profile ID from database!
      email: authResponse.user.email,
      workosUserId: authResponse.user.id,
    })

    console.log('[Verify OTP] Session created with userId:', profile.id)

    // ========================================
    // STEP 4: Return success
    // ========================================
    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: authResponse.user.email,
        workosUserId: authResponse.user.id,
      }
    })

  } catch (error: any) {
    console.error('[Verify OTP] Error:', error)

    if (error?.message?.includes('Invalid code')) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to verify code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
