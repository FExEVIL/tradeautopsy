import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export interface AuthenticatedProfile {
  id: string
  user_id: string | null
  email: string | null
  name: string | null
  workos_user_id: string | null
  auth_provider: string | null
}

export interface AuthResult {
  profile: AuthenticatedProfile | null
  effectiveUserId: string | null
  authMethod: 'supabase' | 'workos' | null
}

/**
 * Gets the authenticated user's profile, handling both Supabase and WorkOS auth methods.
 * This ensures the correct profile is returned regardless of how the user logged in.
 */
export async function getAuthenticatedProfile(): Promise<AuthResult> {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  // Get Supabase user
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()
  
  // Get WorkOS cookies
  const workosUserId = cookieStore.get('workos_user_id')?.value
  const workosProfileId = cookieStore.get('workos_profile_id')?.value
  const activeProfileId = cookieStore.get('active_profile_id')?.value

  let profile: AuthenticatedProfile | null = null
  let effectiveUserId: string | null = null
  let authMethod: 'supabase' | 'workos' | null = null

  // Priority 1: Use active_profile_id if set (most reliable - set during login)
  if (activeProfileId) {
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, email, name, workos_user_id, auth_provider')
      .eq('id', activeProfileId)
      .single()
    
    if (data) {
      profile = data
      // CRITICAL: Use the profile's user_id for data lookups, not the profile id
      // This ensures trades linked to user_id are found
      effectiveUserId = data.user_id || data.id
      authMethod = data.workos_user_id ? 'workos' : 'supabase'
    }
  }

  // Priority 2: Try Supabase user
  if (!profile && supabaseUser) {
    // First try to find profile by user_id
    const { data: profileByUserId } = await supabase
      .from('profiles')
      .select('id, user_id, email, name, workos_user_id, auth_provider')
      .eq('user_id', supabaseUser.id)
      .maybeSingle()
    
    if (profileByUserId) {
      profile = profileByUserId
      effectiveUserId = supabaseUser.id
      authMethod = 'supabase'
    } else {
      // Try to find profile where id = user.id
      const { data: profileById } = await supabase
        .from('profiles')
        .select('id, user_id, email, name, workos_user_id, auth_provider')
        .eq('id', supabaseUser.id)
        .maybeSingle()
      
      if (profileById) {
        profile = profileById
        effectiveUserId = supabaseUser.id
        authMethod = 'supabase'
      } else if (supabaseUser.email) {
        // Try to find by email as last resort
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('id, user_id, email, name, workos_user_id, auth_provider')
          .eq('email', supabaseUser.email.toLowerCase())
          .maybeSingle()
        
        if (profileByEmail) {
          profile = profileByEmail
          effectiveUserId = profileByEmail.user_id || profileByEmail.id
          authMethod = 'supabase'
        }
      }
    }
  }

  // Priority 3: Try WorkOS profile ID
  if (!profile && workosProfileId) {
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, email, name, workos_user_id, auth_provider')
      .eq('id', workosProfileId)
      .maybeSingle()
    
    if (data) {
      profile = data
      // Use user_id if available for data lookups
      effectiveUserId = data.user_id || data.id
      authMethod = 'workos'
    } else if (workosUserId) {
      // Try finding by workos_user_id
      const { data: workosProfile } = await supabase
        .from('profiles')
        .select('id, user_id, email, name, workos_user_id, auth_provider')
        .eq('workos_user_id', workosUserId)
        .maybeSingle()
      
      if (workosProfile) {
        profile = workosProfile
        effectiveUserId = workosProfile.user_id || workosProfile.id
        authMethod = 'workos'
      }
    }
  }

  return { profile, effectiveUserId, authMethod }
}

/**
 * Simple helper to get just the effective user ID for queries
 */
export async function getEffectiveUserId(): Promise<string | null> {
  const { effectiveUserId } = await getAuthenticatedProfile()
  return effectiveUserId
}

