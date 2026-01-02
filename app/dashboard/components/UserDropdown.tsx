'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronDown,
  Loader2,
  UserCircle
} from 'lucide-react'
import { useLogout } from '@/lib/hooks/useLogout'
import { useUser } from '@/lib/contexts/UserContext'

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { logout, isLoading: isLoggingOut } = useLogout()
  const { user, isLoading: isLoadingUser } = useUser()

  const handleNavigate = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.name) {
      return user.name.substring(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 h-10 bg-border-subtle hover:bg-border-default rounded-lg transition-all duration-200 border border-border-default hover:border-border-emphasis"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-purple-primary/20 flex items-center justify-center flex-shrink-0">
          {isLoadingUser ? (
            <Loader2 className="w-4 h-4 text-purple-primary animate-spin" />
          ) : (
            <span className="text-xs font-semibold text-purple-primary">
              {getInitials()}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-text-tertiary transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 w-64 bg-bg-card rounded-lg shadow-xl border border-border-default z-50 overflow-hidden">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-border-subtle bg-border-subtle/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-purple-primary">
                    {getInitials()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  {user?.name && (
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.name}
                    </p>
                  )}
                  {user?.email && (
                    <p className="text-xs text-text-tertiary truncate">
                      {user.email}
                    </p>
                  )}
                  {!user?.name && !user?.email && (
                    <p className="text-sm text-text-tertiary">User</p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => handleNavigate('/dashboard/profiles')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-text-secondary hover:bg-border-subtle hover:text-text-primary transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                <span className="text-sm">My Profiles</span>
              </button>
              
              <button
                onClick={() => handleNavigate('/dashboard/settings')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-text-secondary hover:bg-border-subtle hover:text-text-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
              
              <button
                onClick={() => handleNavigate('/help')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-text-secondary hover:bg-border-subtle hover:text-text-primary transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm">Help & Support</span>
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-border-subtle" />

            {/* Logout */}
            <div className="py-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {isLoggingOut ? 'Logging out...' : 'Log out'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
