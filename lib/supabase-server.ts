import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieStore = ReturnType<typeof cookies> & {
  set?: (options: { name: string; value: string } & CookieOptions) => void
}

function ensureMutableStore(store: CookieStore, action: 'set' | 'remove') {
  if (typeof store.set !== 'function') {
    throw new Error(
      `Supabase tried to ${action} cookies from a read-only context. Pass a mutable cookies() instance from a Route Handler or Middleware.`
    )
  }
}

export function createClient(cookieStore?: CookieStore) {
  const store = cookieStore ?? cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          ensureMutableStore(store, 'set')
          store.set!({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          ensureMutableStore(store, 'remove')
          store.set!({ name, value: '', ...options })
        },
      },
    }
  )
}
