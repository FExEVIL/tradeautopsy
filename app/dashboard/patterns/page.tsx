import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { PatternCard } from './components/PatternCard'
import { PatternProgress } from './components/PatternProgress'

export default async function PatternsPage() {
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

  // Fetch detected patterns (handle table not existing gracefully)
  const { data: patterns, error: patternsError } = await supabase
    .from('detected_patterns')
    .select('*')
    .eq('user_id', effectiveUserId)
    .order('detected_at', { ascending: false })

  // If table doesn't exist, return empty array (table will be created by migration)
  if (patternsError && (patternsError.code === 'PGRST205' || patternsError.code === 'PGRST116' || patternsError.message?.includes('does not exist'))) {
    console.warn('detected_patterns table does not exist yet. Please run the database migration.')
  }

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
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Pattern Library</h1>
          <p className="text-gray-400 mt-2">Behavioral patterns detected in your trading</p>
        </div>

        {/* Pattern Progress Overview */}
        {patternList.length > 0 && (
          <PatternProgress patterns={patternList} />
        )}

        {/* Pattern Cards */}
        {patternList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patternList.map((pattern: any) => (
              <PatternCard key={pattern.type} pattern={pattern} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#0F0F0F] border border-white/5 rounded-2xl">
            <p className="text-gray-400 mb-2">No patterns detected yet</p>
            <p className="text-sm text-gray-500">Keep trading and patterns will be automatically detected</p>
          </div>
        )}
    </div>
  )
}

