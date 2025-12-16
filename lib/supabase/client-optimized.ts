import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMemo } from 'react'

// ✅ Singleton Supabase client
let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null

export function useOptimizedSupabase() {
  return useMemo(() => {
    if (!supabaseInstance) {
      supabaseInstance = createClientComponentClient({
        options: {
          db: {
            schema: 'public',
          },
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
          global: {
            headers: {
              'x-client-info': 'tradeautopsy-web',
            },
          },
        },
      })
    }
    return supabaseInstance
  }, [])
}

// ✅ Server-side optimized client
export function getOptimizedSupabaseClient() {
  if (!supabaseInstance) {
    const { createClient } = require('@/utils/supabase/server')
    return createClient()
  }
  return supabaseInstance
}
