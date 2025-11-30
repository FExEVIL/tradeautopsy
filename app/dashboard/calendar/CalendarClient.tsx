'use client'

import { Trade } from '@/types/trade'
import ProfitCalendar from '../components/ProfitCalendar'

export default function CalendarClient({ trades }: { trades: Trade[] }) {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Trading Calendar</h1>
          <p className="text-gray-400">
            Visual overview of your daily P&L performance
          </p>
        </div>

        <ProfitCalendar trades={trades} />
      </div>
    </div>
  )
}
