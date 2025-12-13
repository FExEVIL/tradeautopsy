import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

/**
 * Get current profile ID for user (from cookie or default)
 */
export async function getCurrentProfileId(userId: string): Promise<string | null> {
  const supabase = await createClient()
  
  // Try to get from cookie first (client-side preference)
  const cookieStore = await cookies()
  const profileIdCookie = cookieStore.get('current_profile_id')?.value
  
  if (profileIdCookie) {
    // Verify profile belongs to user
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileIdCookie)
      .eq('user_id', userId)
      .single()
    
    if (profile) {
      return profileIdCookie
    }
  }
  
  // Fall back to default profile
  const { data: defaultProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single()
  
  return defaultProfile?.id || null
}

/**
 * Get all profiles for user
 */
export async function getUserProfiles(userId: string) {
  const supabase = await createClient()
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }
  
  return profiles || []
}

/**
 * Create default profile for user if none exists
 */
export async function ensureDefaultProfile(userId: string): Promise<string> {
  const supabase = await createClient()
  
  // Check if default profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single()
  
  if (existing) {
    return existing.id
  }
  
  // Create default profile
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      name: 'Default',
      description: 'Default trading profile',
      is_default: true,
      color: '#3b82f6'
    })
    .select()
    .single()
  
  if (error || !newProfile) {
    throw new Error('Failed to create default profile')
  }
  
  return newProfile.id
}
