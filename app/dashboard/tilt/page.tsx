import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { TiltMeter } from '../components/TiltMeter'

export default async function TiltPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: false })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tilt Assessment</h1>
          <p className="text-gray-400">Monitor your emotional state and trading discipline</p>
        </div>

        {trades && trades.length > 0 ? (
          <TiltMeter trades={trades} />
        ) : (
          <div className="bg-neutral-900 rounded-xl p-12 text-center border border-gray-800">
            <p className="text-gray-400 text-lg">No trades found. Import trades to see tilt assessment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
