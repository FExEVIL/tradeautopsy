'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

interface UserInfo {
  id: string | null
  email: string | null
  name: string | null
  avatar_url?: string | null
}

interface UserContextType {
  user: UserInfo | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // First try Supabase auth (this is a local call, fast)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || null,
          name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
        })
        return
      }
      
      // Fallback to API call for WorkOS auth
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser({
          id: data.id || null,
          email: data.email || null,
          name: data.name || data.email?.split('@')[0] || null,
          avatar_url: data.avatar_url || null,
        })
      } else {
        // Not authenticated - that's okay
        setUser(null)
      }
    } catch (err) {
      console.warn('Failed to fetch user:', err)
      setError('Failed to fetch user')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUser()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        fetchUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUser, supabase.auth])

  return (
    <UserContext.Provider value={{ user, isLoading, error, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

