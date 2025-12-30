/**
 * Optimized WorkOS Client Setup
 * Enterprise SSO with proper error handling and type safety
 */

import { WorkOS } from '@workos-inc/node'
import { AppError, ExternalServiceError } from '@/lib/utils/error-handler'

// ============================================
// WORKOS CLIENT INITIALIZATION
// ============================================

const isConfigured = !!(
  process.env.WORKOS_API_KEY && 
  process.env.WORKOS_CLIENT_ID
)

if (!isConfigured && process.env.NODE_ENV === 'production') {
  console.warn('[WorkOS] Credentials not configured in production')
}

export const workos = isConfigured 
  ? new WorkOS(process.env.WORKOS_API_KEY!)
  : null

export const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID || ''
export const WORKOS_REDIRECT_URI = 
  process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://www.tradeautopsy.in/api/auth/callback'
    : 'http://localhost:3000/api/auth/callback')
export const WORKOS_WEBHOOK_SECRET = process.env.WORKOS_WEBHOOK_SECRET || ''

// ============================================
// TYPE DEFINITIONS
// ============================================

export type OAuthProvider = 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth' | 'AppleOAuth'
export type SSOProvider = 'SAMLSSO' | 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth' | 'AppleOAuth'

// ============================================
// HELPER FUNCTIONS
// ============================================

export function isWorkOSEnabled(): boolean {
  return !!workos
}

export function getAuthorizationUrl(provider: OAuthProvider | SSOProvider): string {
  if (!workos) {
    console.error('[WorkOS] Not initialized. API Key:', !!process.env.WORKOS_API_KEY, 'Client ID:', !!process.env.WORKOS_CLIENT_ID)
    throw new ExternalServiceError(
      'WorkOS',
      'WorkOS client not initialized. Please configure WORKOS_API_KEY and WORKOS_CLIENT_ID.',
      undefined,
      { provider }
    )
  }

  if (!WORKOS_CLIENT_ID) {
    console.error('[WorkOS] Client ID is missing')
    throw new ExternalServiceError(
      'WorkOS',
      'WorkOS client ID not configured. Please set WORKOS_CLIENT_ID.',
      undefined,
      { provider }
    )
  }

  if (!WORKOS_REDIRECT_URI) {
    console.error('[WorkOS] Redirect URI is missing')
    throw new ExternalServiceError(
      'WorkOS',
      'WorkOS redirect URI not configured. Please set NEXT_PUBLIC_WORKOS_REDIRECT_URI.',
      undefined,
      { provider }
    )
  }

  console.log('[WorkOS] Getting auth URL for provider:', provider)
  console.log('[WorkOS] Client ID:', WORKOS_CLIENT_ID.substring(0, 10) + '...')
  console.log('[WorkOS] Redirect URI:', WORKOS_REDIRECT_URI)

  try {
    const url = workos.userManagement.getAuthorizationUrl({
      provider: provider as any,
      clientId: WORKOS_CLIENT_ID,
      redirectUri: WORKOS_REDIRECT_URI,
    })

    console.log('[WorkOS] Generated auth URL:', url ? url.substring(0, 50) + '...' : 'null')
    return url
  } catch (error) {
    console.error('[WorkOS] Failed to generate auth URL:', error)
    throw new ExternalServiceError(
      'WorkOS',
      'Failed to generate authorization URL',
      error instanceof Error ? error : undefined,
      { provider }
    )
  }
}

export async function sendMagicAuthCode(email: string): Promise<void> {
  if (!workos) {
    throw new ExternalServiceError(
      'WorkOS',
      'WorkOS client not initialized',
      undefined,
      { email }
    )
  }

  try {
    await workos.userManagement.sendMagicAuthCode({ 
      email: email.toLowerCase().trim(),
      clientId: WORKOS_CLIENT_ID,
    })
  } catch (error) {
    throw new ExternalServiceError(
      'WorkOS',
      'Failed to send magic auth code',
      error instanceof Error ? error : undefined,
      { email }
    )
  }
}

export async function authenticateWithMagicAuth(
  email: string,
  code: string,
  ipAddress?: string,
  userAgent?: string
) {
  if (!workos) {
    throw new ExternalServiceError(
      'WorkOS',
      'WorkOS client not initialized. Please configure WORKOS_API_KEY and WORKOS_CLIENT_ID.',
      undefined,
      { email }
    )
  }

  if (!WORKOS_CLIENT_ID) {
    throw new ExternalServiceError(
      'WorkOS',
      'WorkOS client ID not configured. Please set WORKOS_CLIENT_ID.',
      undefined,
      { email }
    )
  }

  try {
    const normalizedEmail = email.toLowerCase().trim()
    // WorkOS codes are typically 6 digits, but we should preserve the exact format
    // Remove any spaces or dashes, but keep the code as-is otherwise
    const normalizedCode = code.replace(/[\s-]/g, '').trim()

    // Validate code format (should be 6 digits for WorkOS)
    if (!/^\d{6}$/.test(normalizedCode)) {
      throw new AppError(
        'Invalid code format. Please enter the 6-digit code from your email.',
        'INVALID_CODE_FORMAT',
        400
      )
    }

    // Log the attempt (without sensitive data)
    if (process.env.NODE_ENV === 'development') {
      console.log('[WorkOS] Attempting magic auth:', {
        email: normalizedEmail,
        codeLength: normalizedCode.length,
        codeFormat: /^\d{6}$/.test(normalizedCode) ? 'valid' : 'invalid',
        hasClientId: !!WORKOS_CLIENT_ID,
        clientIdLength: WORKOS_CLIENT_ID.length,
      })
    }

    const { user } = await workos.userManagement.authenticateWithMagicAuth({
      email: normalizedEmail,
      code: normalizedCode,
      clientId: WORKOS_CLIENT_ID,
      ipAddress,
      userAgent,
    })

    if (!user) {
      throw new AppError('Invalid verification code', 'INVALID_CODE', 401)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[WorkOS] Magic auth successful:', {
        userId: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      })
    }

    return user
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    // Extract more specific error message from WorkOS
    let errorMessage = 'Failed to authenticate with magic auth'
    let statusCode = 500

    if (error instanceof Error) {
      // Log the actual error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('[WorkOS] Magic auth error:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        })
      }

      // Check for common WorkOS error patterns
      if (error.message.includes('invalid') || error.message.includes('Invalid')) {
        errorMessage = 'Invalid verification code. Please check your code and try again.'
        statusCode = 401
      } else if (error.message.includes('expired') || error.message.includes('Expired')) {
        errorMessage = 'Verification code has expired. Please request a new code.'
        statusCode = 401
      } else if (error.message.includes('not found') || error.message.includes('Not found')) {
        errorMessage = 'No verification code found for this email. Please request a new code.'
        statusCode = 404
      } else if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        errorMessage = 'Too many verification attempts. Please wait a moment and try again.'
        statusCode = 429
      } else if (error.message.includes('Unauthorized') || error.message.includes('unauthorized')) {
        errorMessage = 'Authentication failed. Please check your credentials.'
        statusCode = 401
      } else {
        // Use the actual error message if available
        errorMessage = error.message || errorMessage
      }
    }

    throw new ExternalServiceError(
      'WorkOS',
      errorMessage,
      error instanceof Error ? error : undefined,
      { email, codeLength: code.length, statusCode }
    )
  }
}

export async function authenticateWithCode(code: string) {
  if (!workos) {
    throw new ExternalServiceError(
      'WorkOS',
      'WorkOS client not initialized',
      undefined
    )
  }

  try {
    const { user } = await workos.userManagement.authenticateWithCode({
      code,
      clientId: WORKOS_CLIENT_ID,
    })

    if (!user) {
      throw new AppError('Invalid authorization code', 'INVALID_CODE', 401)
    }

    return user
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new ExternalServiceError(
      'WorkOS',
      'Failed to authenticate with OAuth code',
      error instanceof Error ? error : undefined
    )
  }
}

