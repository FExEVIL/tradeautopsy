import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // ❌ remove await here
  const cookieStore = request.cookies

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check for WorkOS session
  const workosUserId = request.cookies.get('workos_user_id')?.value
  const workosProfileId = request.cookies.get('workos_profile_id')?.value

  // Public routes that don't need authentication
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
  ]
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session && !workosUserId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect to dashboard if already logged in and trying to access login/signup
  if (
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/signup') &&
    (session || workosUserId) &&
    !isPublicRoute
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
