'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  user_id: string
  name: string
  description: string | null
  type: string | null
  color: string
  icon: string
  is_default: boolean
  created_at: string
  updated_at: string
}

interface ProfileContextType {
  profiles: Profile[]
  activeProfile: Profile | null
  isLoading: boolean
  setActiveProfile: (profileId: string) => Promise<void>
  refreshProfiles: () => Promise<void>
  createProfile: (profile: Partial<Profile>) => Promise<Profile>
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | null>(null)

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load profiles on mount
  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    try {
      setIsLoading(true)
      
      // Check Supabase auth first
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check WorkOS auth (fallback)
      const workosUserId = getCookie('workos_user_id')
      const workosProfileId = getCookie('workos_profile_id') || getCookie('active_profile_id')
      
      // Determine effective user ID
      const effectiveUserId = user?.id || workosProfileId
      
      if (!effectiveUserId) {
        setIsLoading(false)
        return
      }

      // Get all profiles for this user
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) {
        // Table might not exist yet
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Profiles table does not exist yet')
          setProfiles([])
          setActiveProfileState(null)
          setIsLoading(false)
          return
        }
        throw error
      }

      setProfiles(profilesData || [])

      // Get current profile from cookie or user preferences
      let activeProfileId = getCookie('active_profile_id') || getCookie('current_profile_id')
      
      // Try user preferences if we have a Supabase user
      if (!activeProfileId && user) {
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('current_profile_id')
          .eq('user_id', user.id)
          .single()
        
        activeProfileId = prefs?.current_profile_id || null
      }

      // Set active profile
      let active: Profile | null = null
      if (activeProfileId && profilesData) {
        active = profilesData.find(p => p.id === activeProfileId) || null
      }
      
      // Fallback to default profile
      if (!active && profilesData) {
        active = profilesData.find(p => p.is_default) || profilesData[0] || null
      }

      setActiveProfileState(active)

      // Store in localStorage for client-side access
      if (active) {
        localStorage.setItem('current_profile_id', active.id)
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
      setProfiles([])
      setActiveProfileState(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function setActiveProfile(profileId: string) {
    try {
      const profile = profiles.find(p => p.id === profileId)
      if (!profile) {
        console.error('Profile not found:', profileId)
        return
      }

      setActiveProfileState(profile)
      localStorage.setItem('current_profile_id', profileId)

      // Update server-side (cookie + DB)
      let response: Response
      try {
        response = await fetch('/api/profile/set-active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId })
        })
      } catch (fetchError: any) {
        // Handle network errors gracefully
        if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          console.warn('Network error updating active profile on server, using local state only')
          router.refresh()
          return
        }
        throw fetchError
      }

      if (!response.ok) {
        console.warn('Failed to update active profile on server:', response.statusText)
      }
      
      // Trigger page refresh to reload data with new profile
      router.refresh()
    } catch (error) {
      console.error('Error setting active profile:', error)
      // Still update local state even if server update fails
      const profile = profiles.find(p => p.id === profileId)
      if (profile) {
        setActiveProfileState(profile)
        localStorage.setItem('current_profile_id', profileId)
        router.refresh()
      }
    }
  }

  async function createProfile(profile: Partial<Profile>): Promise<Profile> {
    try {
      // Get effective user ID (Supabase or WorkOS)
      const { data: { user } } = await supabase.auth.getUser()
      const workosProfileId = getCookie('workos_profile_id') || getCookie('active_profile_id')
      const effectiveUserId = user?.id || workosProfileId
      
      if (!effectiveUserId) throw new Error('User not authenticated')

      const profileName = profile.name?.trim() || 'New Profile'
      
      if (!profileName) {
        throw new Error('Profile name is required')
      }
      
      // Check if profile with this name already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', effectiveUserId)
        .eq('name', profileName)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.warn('Error checking for existing profile:', checkError)
      }

      if (existingProfile) {
        throw new Error('A profile with this name already exists. Please choose a different name.')
      }

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          user_id: effectiveUserId,
          name: profileName,
          description: profile.description?.trim() || null,
          type: profile.type || null,
          color: profile.color || '#3b82f6',
          icon: profile.icon || profile.type || 'default',
          is_default: false
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error creating profile:', error)
        throw new Error(error.message || 'Failed to create profile')
      }
      
      if (!newProfile) throw new Error('Failed to create profile')

      await loadProfiles()
      return newProfile
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
    }
  }

  async function updateProfile(id: string, updates: Partial<Profile>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      await loadProfiles()
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  async function deleteProfile(id: string) {
    try {
      // Don't allow deleting default profile
      const profile = profiles.find(p => p.id === id)
      if (profile?.is_default) {
        throw new Error('Cannot delete default profile')
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (error) throw error

      // If deleting active profile, switch to default
      if (activeProfile?.id === id) {
        const defaultProfile = profiles.find(p => p.is_default && p.id !== id)
        if (defaultProfile) {
          await setActiveProfile(defaultProfile.id)
        } else {
          await loadProfiles()
        }
      } else {
        await loadProfiles()
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      throw error
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        isLoading,
        setActiveProfile,
        refreshProfiles: loadProfiles,
        createProfile,
        updateProfile,
        deleteProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }
  return context
}