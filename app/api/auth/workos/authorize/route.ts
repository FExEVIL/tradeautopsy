import { NextRequest, NextResponse } from 'next/server'
import { workos, WORKOS_CLIENT_ID, WORKOS_REDIRECT_URI } from '@/lib/workos'

export async function POST(request: NextRequest) {
  try {
    if (!workos) {
      return NextResponse.json(
        { error: 'WorkOS not configured. Please add WORKOS_API_KEY and WORKOS_CLIENT_ID to environment variables.' },
        { status: 500 }
      )
    }

    const { provider } = await request.json()

    console.log('[WorkOS] Creating authorization URL for provider:', provider)

    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      provider: provider || 'GoogleOAuth',
      clientId: WORKOS_CLIENT_ID,
      redirectUri: WORKOS_REDIRECT_URI,
    })

    console.log('[WorkOS] Authorization URL:', authorizationUrl)

    return NextResponse.json({ authorizationUrl })

  } catch (error: any) {
    console.error('[WorkOS] Authorization error:', error)
    return NextResponse.json(
      { error: `Authorization failed: ${error.message}` },
      { status: 500 }
    )
  }
}
