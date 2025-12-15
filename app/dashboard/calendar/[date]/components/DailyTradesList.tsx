'use client'

import { format } from 'date-fns'
import { formatINR } from '@/lib/formatters'

export function DailyTradesList({ trades }: { trades: any[] }) {
  const formatPnL = (pnl: number | null) => {
    if (pnl === null || pnl === 0) return '₹0.00'
    return formatINR(pnl)
  }

  return (
    <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Trade Details</h3>
        <span className="text-sm text-gray-400">{trades.length} trades executed</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">TIME</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">SYMBOL</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">TYPE</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">QTY</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">PRICE</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">P&L</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">STRATEGY</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, idx) => {
              const pnl = parseFloat(String(trade.pnl || 0))
              const price = parseFloat(String(trade.average_price || trade.entry_price || trade.exit_price || 0))
              
              return (
                <tr
                  key={trade.id}
                  className={`border-b border-white/5 ${
                    idx % 2 === 0 ? 'bg-black/20' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {trade.created_at ? format(new Date(trade.created_at), 'HH:mm') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-white">
                    {trade.tradingsymbol || trade.symbol || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        trade.transaction_type === 'BUY' || trade.trade_type === 'BUY'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {trade.transaction_type || trade.trade_type || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-white">{trade.quantity || '-'}</td>
                  <td className="px-4 py-3 text-right text-sm text-white">
                    {price > 0 ? formatINR(price) : '-'}
                  </td>
                  <td className={`px-4 py-3 text-right text-sm font-semibold ${
                    pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPnL(pnl)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {trade.strategy || 'Uncategorized'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
