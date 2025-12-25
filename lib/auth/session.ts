
import { cookies } from 'next/headers'

/**
 * SESSION MANAGEMENT (Edge-Compatible)
 * 
 * Uses simple JSON cookies instead of encrypted sessions
 * Works with both Edge Runtime (middleware) and Node.js runtime (API routes)
 * 
 * Note: For production, consider adding encryption if sensitive data is stored
 */

const SESSION_COOKIE_NAME = 'tradeautopsy_session'

export interface SessionData {
  userId: string
  email: string
  workosUserId: string
  firstName?: string
  lastName?: string
  createdAt?: string
}

/**
 * Create a new session and set cookie
 * Alias: setSession (for backward compatibility)
 */
export async function createSession(data: {
  userId: string
  email: string
  workosUserId: string
  firstName?: string
  lastName?: string
}): Promise<SessionData> {
  const cookieStore = await cookies()

  const session: SessionData = {
    userId: data.userId,
    email: data.email,
    workosUserId: data.workosUserId,
    firstName: data.firstName,
    lastName: data.lastName,
    createdAt: new Date().toISOString(),
  }

  // Set cookie with JSON string
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return session
}

/**
 * Alias for backward compatibility
 */
export const setSession = createSession

/**
 * Get current session from cookie
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) {
      return null
    }

    const session = JSON.parse(sessionCookie.value) as SessionData
    return session

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getSession] Error:', error)
    }
    return null
  }
}

/**
 * Destroy session (logout)
 * Alias: clearSession (for backward compatibility)
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
  } catch (error) {
    // Silently fail - session clearing is not critical
    if (process.env.NODE_ENV === 'development') {
      console.error('[destroySession] Error:', error)
    }
  }
}

/**
 * Alias for backward compatibility
 */
export const clearSession = destroySession

/**
 * Update session data
 */
export async function updateSession(data: Partial<SessionData>): Promise<SessionData> {
  const session = await getSession()
  
  if (!session) {
    throw new Error('No session to update')
  }

  const updatedSession: SessionData = {
    ...session,
    ...data,
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(updatedSession), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return updatedSession
}
