interface Trade {
  pnl: number
}

interface HeroPnLCardProps {
  trades: Trade[]
}

export function HeroPnLCard({ trades }: HeroPnLCardProps) {
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  const profitableTrades = trades.filter(t => (t.pnl || 0) > 0).length
  const losingTrades = trades.filter(t => (t.pnl || 0) < 0).length
  const percentChange = 12 // This should be calculated from actual data
  
  const isProfit = totalPnL >= 0

  return (
    <div className="relative overflow-hidden bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 mb-8 hover-lift animate-fade-in">
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 opacity-[0.03] ${
        isProfit 
          ? 'bg-gradient-to-br from-emerald-500 via-transparent to-transparent'
          : 'bg-gradient-to-br from-red-500 via-transparent to-transparent'
      }`}></div>

      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-sm font-medium text-gray-500">Total P&L</p>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
                isProfit 
                  ? 'bg-emerald-500/10 border border-emerald-500/20' 
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <svg className={`w-4 h-4 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  {isProfit ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  )}
                </svg>
                <span className={`font-bold text-sm ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                  {percentChange}%
                </span>
              </div>
            </div>
            
            <h2 className={`text-6xl md:text-7xl font-bold tracking-tight ${
              isProfit ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {isProfit ? '+' : ''}₹{Math.abs(totalPnL).toFixed(2)}
            </h2>
          </div>

          {/* Status Badge */}
          <div className={`px-4 py-2 rounded-xl border ${
            isProfit 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          } font-semibold text-sm backdrop-blur-sm`}>
            {isProfit ? '✓ Profitable' : '⚠ In Loss'}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 text-sm pb-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-gray-400">{profitableTrades} wins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-gray-400">{losingTrades} losses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-400">{trades.length} total</span>
          </div>
        </div>

        {/* Quick Insight */}
        <div className="mt-6 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isProfit 
              ? 'bg-emerald-500/10 border border-emerald-500/20' 
              : 'bg-yellow-500/10 border border-yellow-500/20'
          }`}>
            <span className="text-xl">{isProfit ? '🎯' : '💡'}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-1">
              {isProfit ? 'Great work!' : 'Stay disciplined.'}
            </p>
            <p className="text-sm text-gray-400">
              {isProfit ? (
                <>You're beating <strong className="text-white">68% of traders</strong> this week.</>
              ) : (
                <>Review your <strong className="text-white">losing trades</strong> to improve.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}