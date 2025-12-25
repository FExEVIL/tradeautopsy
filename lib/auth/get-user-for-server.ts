/**
 * Get User for Server Components
 * Unified auth check that works with both WorkOS and Supabase
 * 
 * @module lib/auth/get-user-for-server
 */

import { getSession } from './session'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export interface ServerUser {
  id: string
  email: string
  userId: string // Alias for id for compatibility
}

/**
 * Get authenticated user for server components
 * Checks WorkOS session first, then Supabase session
 * Redirects to login if not authenticated
 * 
 * @returns ServerUser with user info
 */
export async function getUserForServer(): Promise<ServerUser> {
  try {
    // Check WorkOS session first
    const workosSession = await getSession()
    
    if (workosSession) {
      return {
        id: workosSession.userId,
        email: workosSession.email,
        userId: workosSession.userId, // Alias for compatibility
      }
    }
    
    // Fallback to Supabase session
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Log for debugging
    if (error) {
      console.error('[getUserForServer] Supabase auth error:', error)
    }
    
    if (!user) {
      console.warn('[getUserForServer] No user found - redirecting to login')
      // Only redirect if we're certain there's no session
      redirect('/login')
    }
    
    // If there's an error but we have a user, log it but continue
    if (error && user) {
      console.warn('[getUserForServer] Supabase auth error but user exists:', error)
    }
    
    return {
      id: user.id,
      email: user.email || '',
      userId: user.id,
    }
  } catch (error: any) {
    // If it's a redirect error, re-throw it (Next.js handles redirects by throwing)
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    // For other errors, log and redirect
    console.error('[getUserForServer] Unexpected error:', error)
    redirect('/login')
  }
}

/**
 * Get user ID only (for database queries)
 * Returns null if not authenticated (doesn't redirect)
 */
export async function getUserIdForServer(): Promise<string | null> {
  const workosSession = await getSession()
  
  if (workosSession) {
    return workosSession.userId
  }
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  } catch {
    return null
  }
}

