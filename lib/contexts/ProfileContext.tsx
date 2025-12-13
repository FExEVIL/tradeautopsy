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
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // Get all profiles
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
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

      // Get current profile from user preferences
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('current_profile_id')
        .eq('user_id', user.id)
        .single()

      // Set active profile
      let active: Profile | null = null
      if (prefs?.current_profile_id && profilesData) {
        active = profilesData.find(p => p.id === prefs.current_profile_id) || null
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

      // Save to user preferences
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
          // Still update local state even if server update fails
          const profile = profiles.find(p => p.id === profileId)
          if (profile) {
            setActiveProfileState(profile)
            localStorage.setItem('current_profile_id', profileId)
            router.refresh()
          }
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const profileName = profile.name?.trim() || 'New Profile'
      
      if (!profileName) {
        throw new Error('Profile name is required')
      }
      
      // Check if profile with this name already exists (use maybeSingle to avoid errors when not found)
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', profileName)
        .maybeSingle()

      // If checkError exists and it's not a "not found" error, log it but continue
      if (checkError) {
        // PGRST116 = "The result contains 0 rows" - this is expected when no duplicate exists
        if (checkError.code !== 'PGRST116') {
          console.warn('Error checking for existing profile:', checkError)
        }
      }

      // If a profile with this name exists, throw error before attempting insert
      if (existingProfile) {
        console.log('Duplicate profile detected:', { profileName, existingProfileId: existingProfile.id })
        throw new Error('A profile with this name already exists. Please choose a different name.')
      }

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
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
        // Extract error properties - access them directly since they exist as keys
        // Try direct property access first (they might be non-enumerable)
        const directMessage = (error as any)?.message
        const directCode = (error as any)?.code
        const directDetails = (error as any)?.details
        const directHint = (error as any)?.hint
        
        // Fallback values
        const errorMessage = directMessage || String(error) || 'Unknown error'
        const errorCode = directCode || null
        const errorDetails = directDetails || null
        const errorHint = directHint || null
        
        // Use final variables for consistency
        const finalMessage = errorMessage
        const finalCode = errorCode
        const finalDetails = errorDetails
        const finalHint = errorHint
        
        // Log the actual values
        console.error('Raw Supabase error object:', error)
        console.error('Direct property access - message:', directMessage)
        console.error('Direct property access - code:', directCode)
        console.error('Direct property access - details:', directDetails)
        console.error('Direct property access - hint:', directHint)
        console.error('Final error message:', finalMessage)
        console.error('Final error code:', finalCode)
        console.error('Error keys:', error ? Object.keys(error) : 'no keys')
        
        const errorInfo = {
          message: finalMessage,
          code: finalCode,
          details: finalDetails,
          hint: finalHint,
          errorString: String(error),
          errorJSON: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        }
        console.error('Supabase insert error creating profile:', errorInfo)
        
        // Only throw duplicate error if we're CERTAIN it's a duplicate
        // PostgreSQL error code 23505 = unique_violation
        const isDuplicate = finalCode === '23505' || 
            (finalMessage && typeof finalMessage === 'string' && (
              finalMessage.includes('duplicate key') || 
              finalMessage.includes('unique constraint') ||
              finalMessage.includes('profiles_user_id_name_unique') ||
              finalMessage.toLowerCase().includes('duplicate')
            ))
        
        if (isDuplicate) {
          console.error('Duplicate detected - errorCode:', finalCode, 'errorMessage:', finalMessage)
          
          // Check if it's the wrong constraint (user_id only) vs correct constraint (user_id + name)
          if (finalMessage && finalMessage.includes('profiles_user_id_key')) {
            // This is the wrong constraint - user should be able to create multiple profiles
            throw new Error('Database configuration error: Only one profile per user is allowed. Please contact support or run the migration to fix this issue.')
          }
          
          // Correct duplicate error (same name for same user)
          throw new Error('A profile with this name already exists. Please choose a different name.')
        }
        
        // Check for missing table/columns
        if (finalMessage && finalMessage.includes('column') && (finalMessage.includes('does not exist') || finalMessage.includes('schema cache'))) {
          throw new Error('Database schema error: Profiles table is missing or incomplete. Please run the migration SQL in Supabase dashboard (see FIX_PROFILES_TABLE.sql file).')
        }
        
        // Check for trigger errors (dashboard/features creation) - these are non-fatal
        // If profile was actually created despite trigger error, return it
        if (newProfile && finalMessage && (finalMessage.includes('trigger') || finalMessage.includes('profile_dashboards') || finalMessage.includes('profile_features'))) {
          console.warn('Profile created but dashboard/features creation may have failed. This is non-critical.')
          // Profile was created, but dashboard/features failed - this is OK, they'll be created on first load
          await loadProfiles()
          return newProfile
        }
        
        // Generic error - use the most descriptive message available
        const errorMsg = finalMessage !== 'Unknown error' 
          ? finalMessage 
          : (finalDetails || finalHint || 'Failed to create profile. Please check the console for details and try again.')
        throw new Error(errorMsg)
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
          // No default profile, load profiles again
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
