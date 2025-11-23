

interface Trade {
  mood?: string
  sleep_quality?: number
  concentration?: number
  pnl: number
}

interface EmotionalInsightsProps {
  trades: Trade[]
}

export function EmotionalInsights({ trades }: EmotionalInsightsProps) {
  if (trades.length === 0) return null

  const tradesWithMood = trades.filter(t => t.mood)
  
  if (tradesWithMood.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Emotional Analysis</h2>
        </div>
        <p className="text-gray-400 text-center py-8">
          Start tracking your emotional state to see insights
        </p>
      </div>
    )
  }

  // Calculate mood impact
  const moodStats = tradesWithMood.reduce((acc, trade) => {
    const mood = trade.mood || 'Unknown'
    if (!acc[mood]) {
      acc[mood] = { count: 0, totalPnL: 0, wins: 0 }
    }
    acc[mood].count++
    acc[mood].totalPnL += trade.pnl || 0
    if ((trade.pnl || 0) > 0) acc[mood].wins++
    return acc
  }, {} as Record<string, { count: number; totalPnL: number; wins: number }>)

  const moodColors: Record<string, string> = {
    'Confident': 'text-green-400',
    'Neutral': 'text-gray-400',
    'Anxious': 'text-yellow-400',
    'Frustrated': 'text-red-400'
  }

const moodIcons: Record<string, React.ReactElement> = {
    'Confident': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'Neutral': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'Anxious': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    'Frustrated': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Emotional Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(moodStats).map(([mood, stats]) => {
          const winRate = stats.count > 0 ? (stats.wins / stats.count) * 100 : 0
          const avgPnL = stats.count > 0 ? stats.totalPnL / stats.count : 0
          
          return (
            <div key={mood} className="bg-black/30 border border-white/10 rounded-lg p-4">
              <div className={`flex items-center gap-2 mb-3 ${moodColors[mood] || 'text-gray-400'}`}>
                {moodIcons[mood]}
                <span className="font-semibold">{mood}</span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Trades</p>
                  <p className="text-lg font-bold text-white">{stats.count}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Win Rate</p>
                  <p className={`text-lg font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {winRate.toFixed(0)}%
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Avg P&L</p>
                  <p className={`text-lg font-bold ${avgPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{avgPnL.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
