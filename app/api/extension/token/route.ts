import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Helper to get authenticated user
async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const cookieStore = await cookies()
  const workosUserId = cookieStore.get('workos_user_id')?.value
  const workosProfileId = cookieStore.get('workos_profile_id')?.value || cookieStore.get('active_profile_id')?.value
  
  const effectiveUserId = user?.id || workosProfileId
  
  return { user, workosUserId, workosProfileId, effectiveUserId, supabase }
}

// Generate secure random token
function generateToken(): string {
  return `ta_${crypto.randomBytes(32).toString('hex')}`
}

// GET - Fetch current token (masked)
export async function GET(request: NextRequest) {
  try {
    const { effectiveUserId, supabase } = await getAuthenticatedUser()
    
    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Optimized single query using OR condition
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('extension_token, extension_token_created_at')
      .or(`user_id.eq.${effectiveUserId},id.eq.${effectiveUserId}`)
      .limit(1)
      .maybeSingle()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching token:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch token' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        token: profile?.extension_token || null,
        created_at: profile?.extension_token_created_at || null,
        has_token: !!profile?.extension_token,
      }
    })
    
  } catch (error: any) {
    console.error('GET /api/extension/token error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Generate new token
export async function POST(request: NextRequest) {
  try {
    const { effectiveUserId, supabase } = await getAuthenticatedUser()
    
    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Generate new token
    const newToken = generateToken()
    const now = new Date().toISOString()
    
    // First find which column to use
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, user_id')
      .or(`user_id.eq.${effectiveUserId},id.eq.${effectiveUserId}`)
      .limit(1)
      .maybeSingle()
    
    // Update using the correct identifier
    const updateColumn = existingProfile?.user_id === effectiveUserId ? 'user_id' : 'id'
    const { error } = await supabase
      .from('profiles')
      .update({
        extension_token: newToken,
        extension_token_created_at: now,
      })
      .eq(updateColumn, effectiveUserId)
    
    if (error) {
      console.error('Error saving token:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to generate token' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        token: newToken,
        created_at: now,
      }
    })
    
  } catch (error: any) {
    console.error('POST /api/extension/token error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Revoke token
export async function DELETE(request: NextRequest) {
  try {
    const { effectiveUserId, supabase } = await getAuthenticatedUser()
    
    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // First find which column to use
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, user_id')
      .or(`user_id.eq.${effectiveUserId},id.eq.${effectiveUserId}`)
      .limit(1)
      .maybeSingle()
    
    // Update using the correct identifier
    const updateColumn = existingProfile?.user_id === effectiveUserId ? 'user_id' : 'id'
    const { error } = await supabase
      .from('profiles')
      .update({
        extension_token: null,
        extension_token_created_at: null,
      })
      .eq(updateColumn, effectiveUserId)
    
    if (error) {
      console.error('Error revoking token:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to revoke token' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Token revoked successfully'
    })
    
  } catch (error: any) {
    console.error('DELETE /api/extension/token error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
