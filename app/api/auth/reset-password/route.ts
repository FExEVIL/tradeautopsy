import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password/confirm`,
    })

    if (error) {
      console.error('[Reset Password] Error:', error)
      // Don't reveal if email exists or not for security
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Reset Password] Error:', error)
    return NextResponse.json(
      { error: `Failed to send reset link: ${error.message}` },
      { status: 500 }
    )
  }
}
