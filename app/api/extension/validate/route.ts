import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { valid: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const supabase = await createClient()
    
    // First try session auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      return NextResponse.json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
        }
      })
    }
    
    // Check extension token
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id, display_name, email')
      .eq('extension_token', token)
      .single()
    
    if (error || !profile) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: profile.user_id,
        email: profile.email,
        name: profile.display_name,
      }
    })
  } catch (error: any) {
    console.error('[Extension Validate] Error:', error)
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    )
  }
}
