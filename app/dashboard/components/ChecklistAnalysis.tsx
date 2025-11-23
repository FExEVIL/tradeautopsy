'use client'

interface Trade {
  id: string
  pnl: number
  tradingsymbol: string
}

interface ChecklistAnalysisProps {
  trades: Trade[]
}

export function ChecklistAnalysis({ trades }: ChecklistAnalysisProps) {
  if (trades.length === 0) return null

  // Mock data for now - in real implementation, fetch from checklist_responses
  const adherenceStats = {
    fullAdherence: 5,
    partialAdherence: 2,
    noChecklist: 1,
    avgWinRateWithChecklist: 80,
    avgWinRateWithoutChecklist: 25,
    avgPnLWithChecklist: 128.9,
    avgPnLWithoutChecklist: -125.5
  }

  const totalWithChecklist = adherenceStats.fullAdherence + adherenceStats.partialAdherence

  return (
    <div className="nano app/dashboard/components/ChecklistAnalysis.tsx p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Checklist Performance</h2>
          <p className="text-sm text-gray-400">Impact of following your trading plan</p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* With Checklist */}
        <div className="bg-gradient-to-r from-green-950/50 to-green-900/30 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-green-400">With Checklist</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Trades</p>
              <p className="text-2xl font-bold text-white">{totalWithChecklist}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-green-400">{adherenceStats.avgWinRateWithChecklist}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg P&L</p>
              <p className="text-2xl font-bold text-green-400">₹{adherenceStats.avgPnLWithChecklist}</p>
            </div>
          </div>
        </div>

        {/* Without Checklist */}
        <div className="bg-gradient-to-r from-red-950/50 to-red-900/30 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-red-400">Without Checklist</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Trades</p>
              <p className="text-2xl font-bold text-white">{adherenceStats.noChecklist}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-red-400">{adherenceStats.avgWinRateWithoutChecklist}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg P&L</p>
              <p className="text-2xl font-bold text-red-400">₹{adherenceStats.avgPnLWithoutChecklist}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Adherence Breakdown */}
      <div className="bg-black/30 border border-white/10 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4">Adherence Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Full adherence (100%)</span>
            <span className="text-sm font-bold text-green-400">{adherenceStats.fullAdherence} trades</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Partial adherence (50-99%)</span>
            <span className="text-sm font-bold text-yellow-400">{adherenceStats.partialAdherence} trades</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">No checklist used</span>
            <span className="text-sm font-bold text-red-400">{adherenceStats.noChecklist} trades</span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-6 bg-blue-950/30 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-400 mb-1">Insight</p>
            <p className="text-xs text-gray-300">
              Your win rate improves by <strong className="text-green-400">55%</strong> when using checklists. 
              Make it a rule to complete your checklist before every trade!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
