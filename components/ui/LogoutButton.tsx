'use client'

import { LogOut, Loader2 } from 'lucide-react'
import { useLogout } from '@/lib/hooks/useLogout'

interface LogoutButtonProps {
  variant?: 'default' | 'menu' | 'icon' | 'danger'
  className?: string
  showIcon?: boolean
}

export function LogoutButton({ 
  variant = 'default', 
  className = '',
  showIcon = true 
}: LogoutButtonProps) {
  const { logout, isLoading } = useLogout()

  // Icon-only variant (for compact spaces)
  if (variant === 'icon') {
    return (
      <button
        onClick={logout}
        disabled={isLoading}
        className={`p-2 hover:bg-border-subtle rounded-lg transition-colors disabled:opacity-50 ${className}`}
        title="Log out"
        aria-label="Log out"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
        ) : (
          <LogOut className="w-5 h-5 text-text-tertiary hover:text-red-400 transition-colors" />
        )}
      </button>
    )
  }

  // Menu item variant (for dropdowns and sidebars)
  if (variant === 'menu') {
    return (
      <button
        onClick={logout}
        disabled={isLoading}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-text-secondary hover:bg-border-subtle hover:text-red-400 transition-colors rounded-lg disabled:opacity-50 ${className}`}
      >
        {showIcon && (
          isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )
        )}
        <span className="text-sm font-medium">
          {isLoading ? 'Logging out...' : 'Log out'}
        </span>
      </button>
    )
  }

  // Danger variant (red, for settings/account pages)
  if (variant === 'danger') {
    return (
      <button
        onClick={logout}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50 ${className}`}
      >
        {showIcon && (
          isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )
        )}
        <span className="text-sm font-medium">
          {isLoading ? 'Logging out...' : 'Log out'}
        </span>
      </button>
    )
  }

  // Default variant
  return (
    <button
      onClick={logout}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 bg-border-subtle hover:bg-border-default text-text-primary rounded-lg transition-colors border border-border-default disabled:opacity-50 ${className}`}
    >
      {showIcon && (
        isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )
      )}
      <span className="text-sm font-medium">
        {isLoading ? 'Logging out...' : 'Log out'}
      </span>
    </button>
  )
}

