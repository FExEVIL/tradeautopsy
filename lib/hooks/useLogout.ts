'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseLogoutReturn {
  logout: () => Promise<void>
  isLoading: boolean
  error: string | null
}

export function useLogout(): UseLogoutReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const logout = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Logout failed')
      }

      // Clear any localStorage items related to auth/app state
      if (typeof window !== 'undefined') {
        const itemsToClear = [
          'onboarding_completed',
          'cookie_consent',
          'sidebar_collapsed',
          'taskbar_hidden',
          'active_profile_id',
          'dashboard_cache',
        ]
        
        itemsToClear.forEach(item => {
          try {
            localStorage.removeItem(item)
          } catch (e) {
            // Ignore errors (e.g., if localStorage is not available)
          }
        })

        // Clear sessionStorage as well
        try {
          sessionStorage.clear()
        } catch (e) {
          // Ignore errors
        }
      }

      // Redirect to login page
      router.push('/login')
      router.refresh()
      
    } catch (err) {
      console.error('Logout error:', err)
      setError(err instanceof Error ? err.message : 'Logout failed')
      
      // Even on error, try to redirect to login
      // This ensures users can always "escape" the app
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return { logout, isLoading, error }
}

