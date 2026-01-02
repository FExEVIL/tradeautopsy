import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { cookies } from 'next/headers'
import { analyzeTradingBehavior } from '@/lib/behavioral-analyzer'
import BehavioralClient from './BehavioralClient'
import { PatternLibrarySection } from './components/PatternLibrarySection'
import { MistakesDashboard } from './components/MistakesDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Library, AlertTriangle } from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'

export default async function BehavioralPage() {
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

  // Fetch trades with profile filter
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', effectiveUserId)
    .is('deleted_at', null)
    .order('trade_date', { ascending: true })

  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }

  const { data: trades } = await tradesQuery

  // Ensure trades is an array
  const safeTrades = trades || []
  
  // Generate insights, defaulting to empty array if analyzer returns null/undefined
  const insights = analyzeTradingBehavior(safeTrades) || []

  // Fetch detected patterns
  let patternsQuery = supabase
    .from('detected_patterns')
    .select('*')
    .eq('user_id', effectiveUserId)
    .order('detected_at', { ascending: false })

  if (profileId) {
    patternsQuery = patternsQuery.eq('profile_id', profileId)
  }

  const { data: patterns, error: patternsError } = await patternsQuery

  // Group by pattern type and aggregate
  const aggregated = (patterns || []).reduce((acc: Record<string, any>, p) => {
    if (!acc[p.pattern_type]) {
      acc[p.pattern_type] = {
        type: p.pattern_type,
        occurrences: 0,
        totalCost: 0,
        tradesAffected: [],
        firstDetected: p.detected_at,
        lastDetected: p.detected_at
      }
    }
    acc[p.pattern_type].occurrences += p.occurrences || 1
    acc[p.pattern_type].totalCost += parseFloat(String(p.total_cost || '0'))
    acc[p.pattern_type].tradesAffected.push(...(p.trades_affected || []))
    
    // Update dates
    if (new Date(p.detected_at) < new Date(acc[p.pattern_type].firstDetected)) {
      acc[p.pattern_type].firstDetected = p.detected_at
    }
    if (new Date(p.detected_at) > new Date(acc[p.pattern_type].lastDetected)) {
      acc[p.pattern_type].lastDetected = p.detected_at
    }
    
    return acc
  }, {})

  const patternList = Object.values(aggregated)

  return (
    <PageLayout
      title="Behavioral Analysis"
      subtitle="Understand your trading psychology and patterns"
      icon="brain"
    >
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="bg-[#111111] border border-[#1f1f1f] p-1 rounded-lg">
          <TabsTrigger 
            value="analysis" 
            className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30 text-gray-400 border border-transparent"
          >
            <Brain className="w-4 h-4 mr-2" />
            Pattern Detection
          </TabsTrigger>
          <TabsTrigger 
            value="library" 
            className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30 text-gray-400 border border-transparent"
          >
            <Library className="w-4 h-4 mr-2" />
            Pattern Library
          </TabsTrigger>
          <TabsTrigger 
            value="mistakes" 
            className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30 text-gray-400 border border-transparent"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Mistakes Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <BehavioralClient insights={insights} trades={safeTrades} />
        </TabsContent>

        <TabsContent value="library">
          <PatternLibrarySection patterns={patternList} />
        </TabsContent>

        <TabsContent value="mistakes">
          <MistakesDashboard />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
