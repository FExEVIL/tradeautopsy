import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return Response.redirect(new URL('/dashboard', request.url))
  }

  return null // Continue with request
}
