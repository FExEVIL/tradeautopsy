'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Settings } from 'lucide-react'
import { useProfile } from '@/lib/contexts/ProfileContext'
import { useProfileDashboard } from '@/lib/contexts/ProfileDashboardContext'
import { useRouter } from 'next/navigation'
import { getIcon } from '@/lib/icons'

export function ProfileSwitcher() {
  const { profiles, activeProfile, setActiveProfile, isLoading } = useProfile()
  const { loadDashboard } = useProfileDashboard()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleCreateProfile = () => {
    router.push('/dashboard/profiles?action=create')
    setIsOpen(false)
  }

  const handleManageProfiles = () => {
    router.push('/dashboard/profiles')
    setIsOpen(false)
  }

  if (isLoading) {
    return (
      <div className="h-12 w-48 animate-pulse bg-border-subtle rounded-lg border border-border-default" />
    )
  }

  // Show create profile button if no profiles exist
  if (!activeProfile && profiles.length === 0) {
    return (
      <button
        onClick={handleCreateProfile}
        className="flex items-center gap-2 px-4 py-2 h-12 bg-blue-subtle hover:bg-blue-primary/20 border border-blue-border rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4 text-blue-primary" />
        <span className="text-sm font-medium text-blue-primary">Create Profile</span>
      </button>
    )
  }

  // Show placeholder if no active profile but profiles exist (shouldn't happen)
  if (!activeProfile) {
    const DefaultIcon = getIcon('profile', 'default')
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 h-12 bg-border-subtle border border-border-default rounded-lg hover:bg-border-default transition-colors"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <DefaultIcon size={18} className="text-text-tertiary" />
        </div>
        <span className="text-sm font-medium text-text-tertiary">Select Profile</span>
        <ChevronDown className="w-4 h-4 text-text-tertiary" />
      </button>
    )
  }

  // Get icon component for active profile
  const ActiveIcon = getIcon('profile', activeProfile.type || activeProfile.icon || 'default')

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 h-12 bg-border-subtle hover:bg-border-default rounded-lg transition-all duration-200 border border-border-default hover:border-border-emphasis min-w-[160px] sm:min-w-[180px]"
      >
        {/* Icon instead of emoji */}
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <ActiveIcon size={18} className="text-purple-primary" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <span className="text-sm font-medium text-text-primary block truncate">
            {activeProfile.name}
        </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-text-tertiary transition-transform flex-shrink-0 ${
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
          <div className="absolute top-full mt-2 right-0 w-72 bg-bg-card rounded-lg shadow-xl border border-border-default z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Trading Profiles
              </h3>
            </div>

            {/* Profile List */}
            <div className="max-h-80 overflow-y-auto py-2">
              {profiles.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-text-tertiary mb-3">No profiles found</p>
                  <button
                    onClick={handleCreateProfile}
                    className="text-sm text-blue-primary hover:text-blue-primary/80"
                  >
                    Create your first profile
                  </button>
              </div>
              ) : (
                profiles.map(profile => {
                  const ProfileIcon = getIcon('profile', profile.type || profile.icon || 'default')
                  
                  return (
                <button
                  key={profile.id}
                      onClick={async () => {
                        await setActiveProfile(profile.id)
                        // Load dashboard for the new profile
                        await loadDashboard(profile.id)
                        setIsOpen(false)
                        // Add smooth transition class
                        document.body.classList.add('profile-switching')
                        setTimeout(() => {
                          document.body.classList.remove('profile-switching')
                        }, 300)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                        profile.id === activeProfile.id
                          ? 'bg-blue-subtle border-l-2 border-blue-primary'
                          : 'hover:bg-border-subtle'
                  }`}
                >
                      {/* Icon container with colored background */}
                  <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          profile.id === activeProfile.id 
                            ? 'bg-blue-subtle' 
                            : 'bg-border-subtle'
                        }`}
                        style={{ 
                          backgroundColor: profile.color 
                            ? `${profile.color}20` 
                            : undefined 
                        }}
                      >
                        <ProfileIcon 
                          size={18} 
                          className={
                            profile.id === activeProfile.id 
                              ? 'text-blue-primary' 
                              : 'text-text-tertiary'
                          }
                          style={{
                            color: profile.color || undefined
                          }}
                  />
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary truncate">
                      {profile.name}
                          </span>
                      {profile.is_default && (
                            <span className="text-[10px] bg-border-subtle text-text-secondary px-1.5 py-0.5 rounded uppercase font-semibold flex-shrink-0">
                              Default
                            </span>
                      )}
                    </div>
                    {profile.description && (
                          <p className="text-xs text-text-tertiary mt-0.5 truncate">
                        {profile.description}
                          </p>
                        )}
                      </div>
                      
                      {profile.id === activeProfile.id && (
                        <div className="w-2 h-2 rounded-full bg-green-primary flex-shrink-0" />
                      )}
                    </button>
                  )
                })
                    )}
                  </div>

            {/* Footer Actions */}
            <div className="border-t border-border-subtle p-2 space-y-1">
                <button
                  onClick={handleCreateProfile}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-border-subtle rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                Create New Profile
              </button>
              
              <button
                onClick={handleManageProfiles}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-border-subtle rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Manage Profiles
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
