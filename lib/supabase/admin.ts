/**
 * Supabase Admin Client
 * Uses service role key to bypass RLS policies
 * 
 * ⚠️ SECURITY WARNING:
 * - ONLY use in API routes (server-side)
 * - NEVER expose to client-side code
 * - NEVER commit service role key to git
 * - This client bypasses all Row Level Security policies
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client with service role key
 * This client bypasses RLS policies and should only be used server-side
 * 
 * @returns Supabase client with admin privileges
 * @throws Error if service role key is not configured
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured. This is required for admin operations.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export alias for backward compatibility
export const createClient = createAdminClient

