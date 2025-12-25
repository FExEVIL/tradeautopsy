/**
 * Database Test Utilities
 * 
 * Utilities for testing database operations and RLS policies
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Create a test Supabase client
 */
export const createTestClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
  
  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Create an admin Supabase client (bypasses RLS)
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Clean up test data from database
 */
export const cleanupTestData = async (table: string, testUserId: string) => {
  const admin = createAdminClient()
  await admin.from(table).delete().eq('user_id', testUserId)
}

/**
 * Seed test data into database
 */
export const seedTestData = async <T extends Record<string, any>>(
  table: string,
  data: T[],
) => {
  const admin = createAdminClient()
  const { error } = await admin.from(table).insert(data)
  if (error) {
    throw new Error(`Failed to seed test data: ${error.message}`)
  }
}

/**
 * Get test user ID
 */
export const getTestUserId = () => {
  return process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000'
}

/**
 * Wait for database operation to complete
 */
export const waitForDbOperation = async (
  operation: () => Promise<any>,
  timeout = 5000,
) => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = await operation()
      if (result && !result.error) {
        return result
      }
    } catch (error) {
      // Continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  
  throw new Error(`Database operation timed out after ${timeout}ms`)
}

