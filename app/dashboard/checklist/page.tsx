import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { ChecklistClient } from './ChecklistClient'
import { PageLayout } from '@/components/layouts/PageLayout'
import { cookies } from 'next/headers'

export default async function ChecklistPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  const workosUserId = cookieStore.get('workos_user_id')?.value
  
  if (authError || (!user && !workosUserId)) {
    redirect('/login')
  }

  const effectiveUserId = user?.id || workosUserId
  const profileId = await getCurrentProfileId(supabase, effectiveUserId)

  if (!profileId) {
    redirect('/dashboard')
  }

  // Get today's checklist
  const today = new Date().toISOString().split('T')[0]
  const { data: todayChecklist } = await supabase
    .from('checklists')
    .select('*')
    .eq('user_id', effectiveUserId)
    .eq('profile_id', profileId)
    .eq('date', today)
    .maybeSingle()

  // Get default template
  const { data: defaultTemplate } = await supabase
    .from('checklist_templates')
    .select('*')
    .eq('user_id', effectiveUserId)
    .eq('profile_id', profileId)
    .eq('is_default', true)
    .maybeSingle()

  // Get streak
  const { data: streak } = await supabase
    .from('checklist_streaks')
    .select('*')
    .eq('user_id', effectiveUserId)
    .eq('profile_id', profileId)
    .maybeSingle()

  // Get recent checklists (last 7 days)
  const { data: recentChecklists } = await supabase
    .from('checklists')
    .select('date, completed_at')
    .eq('user_id', effectiveUserId)
    .eq('profile_id', profileId)
    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false })

  return (
    <PageLayout
      title="Pre-Market Checklist"
      subtitle="Start your trading day right"
      icon="checkSquare"
    >
      <ChecklistClient
        initialChecklist={todayChecklist}
        defaultTemplate={defaultTemplate}
        initialStreak={streak}
        recentChecklists={recentChecklists || []}
      />
    </PageLayout>
  )
}

