import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { EquityCurveChart } from '../components/EquityCurveChart'
import { DailyPnLChart } from '../components/DailyPnLChart'

export default async function ChartsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: true })

  if (!trades || trades.length === 0) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Performance Charts</h1>
          <div className="bg-neutral-900 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No trades found. Import trades to see charts.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Performance Charts</h1>
        
        <div className="space-y-8">
          <EquityCurveChart trades={trades} />
          <DailyPnLChart trades={trades} />
        </div>
      </div>
    </div>
  )
}
