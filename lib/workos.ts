import { WorkOS } from '@workos-inc/node'

// Check if WorkOS is configured
const isConfigured = !!(
  process.env.WORKOS_API_KEY && 
  process.env.WORKOS_CLIENT_ID
)

if (!isConfigured && process.env.NODE_ENV === 'production') {
  console.warn('WorkOS credentials not configured in production')
}

// Initialize WorkOS client
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

// Helper: Check if WorkOS is enabled
export const isWorkOSEnabled = () => !!workos

// Helper: Get authorization URL
export function getAuthorizationUrl(provider: string = 'GoogleOAuth') {
  if (!workos) {
    throw new Error('WorkOS not initialized')
  }

  return workos.userManagement.getAuthorizationUrl({
    provider,
    clientId: WORKOS_CLIENT_ID,
    redirectUri: WORKOS_REDIRECT_URI,
  })
}
