import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsCards } from '../components/AnalyticsCards'
import { ImprovedEquityCurve } from '../components/ImprovedEquityCurve'
import { PnLByDay } from '../components/PnLByDay'

export default async function PerformancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_time', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Performance Analytics</h1>
      
      <div className="space-y-6">
        <AnalyticsCards trades={trades || []} />
        <ImprovedEquityCurve trades={trades || []} />
        <PnLByDay trades={trades || []} />
      </div>
    </div>
  )
}
