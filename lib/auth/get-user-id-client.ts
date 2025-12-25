/**
 * Get User ID for Client Components
 * Works with both WorkOS and Supabase sessions
 * 
 * @module lib/auth/get-user-id-client
 */

'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

/**
 * Get current user ID in client components
 * Checks WorkOS session cookie first, then Supabase auth
 * 
 * @returns User ID or null if not authenticated
 */
export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUserId() {
      // Check WorkOS session cookie (workos_user_id from legacy or workos_session)
      try {
        // Try legacy cookie first
        const workosUserId = document.cookie
          .split('; ')
          .find(row => row.startsWith('workos_user_id='))
          ?.split('=')[1]
        
        if (workosUserId) {
          setUserId(workosUserId)
          return
        }
      } catch (e) {
        // Ignore cookie read errors
      }

      // Fallback to Supabase auth
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
        }
      } catch (error) {
        console.error('[useUserId] Error getting user:', error)
      }
    }

    getUserId()
  }, [supabase])

  return userId
}

/**
 * Get user ID synchronously (for immediate use)
 * Only checks cookies, doesn't do async auth check
 */
export function getUserIdSync(): string | null {
  if (typeof window === 'undefined') return null

  try {
    // Check WorkOS cookie
    const workosUserId = document.cookie
      .split('; ')
      .find(row => row.startsWith('workos_user_id='))
      ?.split('=')[1]
    
    return workosUserId || null
  } catch (e) {
    return null
  }
}

