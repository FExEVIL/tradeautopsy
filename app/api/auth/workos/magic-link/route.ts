import { NextRequest, NextResponse } from 'next/server'
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos'

export async function POST(request: NextRequest) {
  try {
    if (!workos) {
      return NextResponse.json(
        { error: 'WorkOS not configured. Please add WORKOS_API_KEY and WORKOS_CLIENT_ID to environment variables.' },
        { status: 500 }
      )
    }

    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    console.log('[WorkOS] Sending magic link to:', email)

    // Send magic link via WorkOS
    const magicLink = await workos.userManagement.sendMagicAuthCode({
      email,
      clientId: WORKOS_CLIENT_ID,
    })

    console.log('[WorkOS] Magic link sent successfully')

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[WorkOS] Magic link error:', error)
    return NextResponse.json(
      { error: `Failed to send magic link: ${error.message}` },
      { status: 500 }
    )
  }
}
