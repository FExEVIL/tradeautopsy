import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { analyzeTradingBehavior } from '@/lib/behavioral-analyzer'
import BehavioralClient from './BehavioralClient'
import { PatternLibrarySection } from './components/PatternLibrarySection'
import { MistakesDashboard } from './components/MistakesDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Library, AlertTriangle } from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'

export default async function BehavioralPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileId = await getCurrentProfileId(user.id)

  // Fetch trades with profile filter
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
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
    .eq('user_id', user.id)
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
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-lg">
          <TabsTrigger value="analysis" className="data-[state=active]:bg-white/10">
            <Brain className="w-4 h-4 mr-2" />
            Pattern Detection
          </TabsTrigger>
          <TabsTrigger value="library" className="data-[state=active]:bg-white/10">
            <Library className="w-4 h-4 mr-2" />
            Pattern Library
          </TabsTrigger>
          <TabsTrigger value="mistakes" className="data-[state=active]:bg-white/10">
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
