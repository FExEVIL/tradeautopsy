import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * EDGE-COMPATIBLE MIDDLEWARE
 * 
 * This middleware works in Edge Runtime (no Node.js modules like crypto/iron-session)
 * Uses simple cookie parsing instead of encrypted sessions
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ========================================
  // STEP 1: Allow static files and API routes
  // ========================================
  if (
    pathname.startsWith('/_next') ||     // Next.js internals
    pathname.startsWith('/api') ||        // API routes
    pathname.includes('.')                // Static files (.svg, .png, etc)
  ) {
    return NextResponse.next()
  }

  // ========================================
  // STEP 2: Define public routes
  // ========================================
  const publicRoutes = ['/', '/login', '/signup', '/verify']
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // ========================================
  // STEP 3: Check authentication
  // ========================================
  const sessionCookie = request.cookies.get('tradeautopsy_session')
  let isAuthenticated = false

  if (sessionCookie?.value) {
    try {
      // Parse JSON session cookie
      const session = JSON.parse(sessionCookie.value)
      isAuthenticated = !!(session?.userId)
    } catch {
      // Invalid session cookie - treat as unauthenticated
      isAuthenticated = false
    }
  }

  // ========================================
  // STEP 4: Redirect logic
  // ========================================

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login with return URL
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ========================================
  // STEP 5: Allow request
  // ========================================
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Files with extensions (.svg, .png, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
