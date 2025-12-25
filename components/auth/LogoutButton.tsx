'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'

interface LogoutButtonProps {
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export function LogoutButton({ className, showIcon = true, children }: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Logout failed:', await response.text())
      }

      // Always redirect to login, even if logout request failed
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect on error
      router.push('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className || "flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : showIcon ? (
        <LogOut className="w-4 h-4" />
      ) : null}
      {children || 'Sign Out'}
    </button>
  )
}

export default LogoutButton

