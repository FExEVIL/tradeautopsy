// Cookie consent management utilities

export type CookieConsent = {
  essential: boolean // Always true, cannot be disabled
  analytics: boolean
  preferences: boolean
  timestamp: number
}

const COOKIE_CONSENT_KEY = 'cookie_consent'

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) return null
    
    const consent = JSON.parse(stored) as CookieConsent
    // Ensure essential is always true
    consent.essential = true
    return consent
  } catch (error) {
    console.warn('Failed to parse cookie consent:', error)
    return null
  }
}

export function setCookieConsent(consent: Partial<CookieConsent>): void {
  if (typeof window === 'undefined') return
  
  try {
    const existing = getCookieConsent()
    const newConsent: CookieConsent = {
      essential: true, // Always true
      analytics: consent.analytics ?? existing?.analytics ?? false,
      preferences: consent.preferences ?? existing?.preferences ?? false,
      timestamp: Date.now(),
    }
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent))
    
    // Trigger custom event for other components to react
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: newConsent }))
  } catch (error) {
    console.warn('Failed to save cookie consent:', error)
  }
}

export function hasConsented(): boolean {
  return getCookieConsent() !== null
}

export function shouldLoadAnalytics(): boolean {
  const consent = getCookieConsent()
  return consent?.analytics === true
}

export function shouldLoadPreferences(): boolean {
  const consent = getCookieConsent()
  return consent?.preferences === true
}

export function clearCookieConsent(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(COOKIE_CONSENT_KEY)
  window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: null }))
}

