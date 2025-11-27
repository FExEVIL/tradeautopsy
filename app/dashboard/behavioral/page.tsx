import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { analyzeTradingBehavior } from '@/lib/behavioral-analyzer'
import BehavioralClient from './BehavioralClient'

export default async function BehavioralPage() {
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
          <h1 className="text-3xl font-bold text-white mb-8">Behavioral Analysis</h1>
          <div className="bg-neutral-900 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No trades found. Import trades to see behavioral insights.</p>
          </div>
        </div>
      </div>
    )
  }

  const insights = analyzeTradingBehavior(trades)

  return <BehavioralClient insights={insights} trades={trades} />
}
