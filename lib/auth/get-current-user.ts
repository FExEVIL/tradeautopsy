/**
 * Get Current User Helper
 * Convenience function to get the current authenticated user
 * 
 * @module lib/auth/get-current-user
 */

import { getSession } from './session'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface CurrentUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  emailVerified?: boolean
  profileId?: string
  profile?: any
}

/**
 * Get current authenticated user
 * Checks WorkOS session first, then falls back to Supabase session
 * 
 * @returns CurrentUser or null if not authenticated
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Try WorkOS session first
  const workosSession = await getSession()
  
  if (workosSession) {
    // Optionally fetch full profile from Supabase
    let profile = null
    if (workosSession.profileId) {
      try {
        const supabase = createAdminClient()
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', workosSession.profileId)
          .single()
        
        profile = data
      } catch (error) {
        console.error('[getCurrentUser] Failed to fetch profile:', error)
      }
    }
    
    return {
      id: workosSession.userId,
      email: workosSession.email,
      firstName: workosSession.firstName,
      lastName: workosSession.lastName,
      emailVerified: workosSession.emailVerified,
      profileId: workosSession.profileId,
      profile,
    }
  }
  
  // Fallback to Supabase session (for backward compatibility)
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }
    
    // Try to get profile using admin client (for RLS bypass)
    let profile = null
    try {
      const adminSupabase = createAdminClient()
      const { data } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      profile = data
    } catch (profileError) {
      console.error('[getCurrentUser] Failed to fetch profile:', profileError)
    }
    
    return {
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0],
      lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
      emailVerified: user.email_confirmed_at !== null,
      profileId: profile?.id,
      profile,
    }
  } catch (error) {
    console.error('[getCurrentUser] Error:', error)
    return null
  }
}

/**
 * Require authentication - throws error if not authenticated
 * Useful for API routes and server components
 * 
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

