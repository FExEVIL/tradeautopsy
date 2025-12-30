import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { generateMorningBrief } from '@/lib/morning-brief'
import { getCurrentProfileId } from '@/lib/profile-utils'
import MorningBriefPageClient from './MorningBriefPageClient'

export default async function MorningBriefPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  // Check Supabase auth
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check WorkOS auth (fallback)
  const workosUserId = cookieStore.get('workos_user_id')?.value
  const workosProfileId = cookieStore.get('workos_profile_id')?.value || cookieStore.get('active_profile_id')?.value
  
  // Must have either Supabase user OR WorkOS session
  if (!user && !workosUserId) {
    redirect('/login')
  }
  
  // Use effective user ID for queries
  const effectiveUserId = user?.id || workosProfileId
  const profileId = effectiveUserId ? await getCurrentProfileId(effectiveUserId) : workosProfileId

  // Generate brief
  const brief = await generateMorningBrief(effectiveUserId, profileId)

  return <MorningBriefPageClient brief={brief} />
}
