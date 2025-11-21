import { KiteConnect } from 'kiteconnect'

export const ZERODHA_STATE_COOKIE = 'zerodha_oauth_state'
export const ZERODHA_STATE_TTL = 60 * 5 // 5 minutes

// Initialize Kite Connect client
export function createKiteClient(accessToken?: string) {
  const kc = new KiteConnect({
    api_key: process.env.ZERODHA_API_KEY!,
  })

  if (accessToken) {
    kc.setAccessToken(accessToken)
  }

  return kc
}

// Get login URL for OAuth
export function getZerodhaLoginURL() {
  const kc = createKiteClient()
  return kc.getLoginURL()
}

// Generate session from request token
export async function generateZerodhaSession(requestToken: string) {
  const kc = createKiteClient()
  
  try {
    const session = await kc.generateSession(
      requestToken,
      process.env.ZERODHA_API_SECRET!
    )
    
    return {
      success: true,
      data: session,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate session'
    console.error('Zerodha session generation failed:', error)
    return {
      success: false,
      error: message,
    }
  }
}

// Fetch all trades for a user
export async function fetchZerodhaTrades(accessToken: string) {
  const kc = createKiteClient(accessToken)
  
  try {
    const trades = await kc.getTrades()
    return {
      success: true,
      data: trades,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch trades'
    console.error('Failed to fetch trades:', error)
    return {
      success: false,
      error: message,
    }
  }
}
