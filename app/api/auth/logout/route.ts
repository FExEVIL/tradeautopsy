import { NextRequest, NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth/session'

/**
 * POST /api/auth/logout
 * 
 * Clears session cookie
 */
export async function POST(request: NextRequest) {
  try {
    await destroySession()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Logout] Error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Allow GET for simple logout links
  return POST(request)
}
