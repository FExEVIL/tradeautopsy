import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Use getUser() instead of getSession() - more reliable
  const { data: { user } } = await supabase.auth.getUser()

  // Check for WorkOS session
  const workosUserId = request.cookies.get('workos_user_id')?.value

  const pathname = request.nextUrl.pathname

  // Public routes - no auth needed
  const publicRoutes = [
    '/login',
    '/signup',
    '/verify',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/auth/error',
    '/api/auth',
    '/api/health',
    '/privacy',
    '/terms',
  ]

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isLoggedIn = user || workosUserId

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from login/signup
  if ((pathname === '/login' || pathname === '/signup') && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}