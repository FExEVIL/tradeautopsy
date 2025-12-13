import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { generateMorningBrief } from '@/lib/morning-brief'
import { getCurrentProfileId } from '@/lib/profile-utils'
import MorningBriefPageClient from './MorningBriefPageClient'

export default async function MorningBriefPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get current profile
  const profileId = await getCurrentProfileId(user.id)

  // Generate brief
  const brief = await generateMorningBrief(user.id, profileId)

  return <MorningBriefPageClient brief={brief} />
}
