import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: true })

  // Process trades into daily P&L map
  const dailyData: { [date: string]: { pnl: number; trades: any[]; count: number } } = {}

  ;(trades || []).forEach(t => {
    const dateKey = t.trade_date ? new Date(t.trade_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    const pnl = parseFloat(t.pnl || 0)

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { pnl: 0, trades: [], count: 0 }
    }

    dailyData[dateKey].pnl += pnl
    dailyData[dateKey].trades.push(t)
    dailyData[dateKey].count++
  })

  return <CalendarClient dailyData={dailyData} />
}