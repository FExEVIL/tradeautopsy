import { classifyTradeStrategy } from '@/lib/strategy-classifier'

interface Trade {
  id: string
  tradingsymbol: string
  transaction_type: string
  quantity: number
  average_price?: number        
  entry_price?: number          
  price: number
  pnl: number
  product: string
  trade_date: string | null
}

interface MobileTradeCardProps {
  trade: Trade
}

export function MobileTradeCard({ trade }: MobileTradeCardProps) {
  const strategy = classifyTradeStrategy(trade)
  
  const strategyIcons: Record<string, string> = {
    'Intraday': '⚡',
    'Delivery': '📦',
    'Swing': '🔄',
    'Options': '⚙️'
  }

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 active:scale-98 transition-transform">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{trade.tradingsymbol}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-md font-medium ${
              trade.transaction_type === 'BUY' 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {trade.transaction_type}
            </span>
            <span className="text-xs px-2 py-1 rounded-md font-medium bg-gray-800 text-gray-400">
              {strategyIcons[strategy]} {strategy}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${
            (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {(trade.pnl || 0) >= 0 ? '+' : ''}₹{(trade.pnl || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 mb-1">Quantity</p>
          <p className="text-white font-medium">{trade.quantity}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Price</p>
<p className="text-white font-medium">₹{(trade.average_price || trade.entry_price || 0).toFixed(2)}</p>

        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          {trade.trade_date 
            ? new Date(trade.trade_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            : 'N/A'
          }
        </p>
      </div>
    </div>
  )
}

export function MobileTradesList({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-12 text-center">
        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <p className="text-gray-400 text-lg">No trades found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {trades.map((trade) => (
<MobileTradeCard key={trade.id} trade={trade} />

      
      ))}
    </div>
  )
}
