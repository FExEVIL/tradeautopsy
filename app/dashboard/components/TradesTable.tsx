import { classifyTradeStrategy } from '@/lib/strategy-classifier'
import { Trade } from '@/types/trade'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { PnLIndicator } from '@/components/PnLIndicator'
import { formatINR } from '@/lib/formatters'

// ✅ ADD SORT TYPES
type SortField = 'date' | 'symbol' | 'pnl' | 'quantity' | 'strategy' | null
type SortDirection = 'asc' | 'desc'

interface TradesTableProps {
  trades: Trade[]
  onTradeClick?: (trade: Trade) => void
  // ✅ ADD SORT PROPS
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

export function TradesTable({ 
  trades, 
  onTradeClick,
  sortField,
  sortDirection,
  onSort
}: TradesTableProps) {
  
  // ✅ ADD SORTABLE HEADER COMPONENT
  const SortableHeader = ({ 
    field, 
    label, 
    align = 'left' 
  }: { 
    field: SortField
    label: string
    align?: 'left' | 'right'
  }) => {
    const isActive = sortField === field
    return (
      <th 
        className={`py-4 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors select-none ${
          align === 'right' ? 'text-right' : 'text-left'
        }`}
        onClick={() => onSort(field)}
      >
        <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
          {label}
          {isActive ? (
            sortDirection === 'asc' ? (
              <ArrowUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDown className="w-4 h-4 text-emerald-400" />
            )
          ) : (
            <ArrowUpDown className="w-4 h-4 opacity-30" />
          )}
        </div>
      </th>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <p className="text-gray-400 text-lg">No trades found</p>
      </div>
    )
  }

  const getStrategyBadge = (trade: Trade) => {
    const strategy = classifyTradeStrategy({ ...trade, product: trade.product || 'MIS' })
    
    const badges = {
      'Intraday': {
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        ),
        color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      },
      'Delivery': {
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        ),
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      },
      'Swing': {
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ),
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      },
      'Options': {
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      }
    }

    const badge = badges[strategy as keyof typeof badges] || badges['Delivery']

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${badge.color}`}>
        {badge.icon}
        {strategy}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {/* ✅ REPLACE REGULAR <th> WITH SortableHeader */}
            <SortableHeader field="symbol" label="Symbol" />
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Type</th>
            <SortableHeader field="strategy" label="Strategy" />
            <SortableHeader field="quantity" label="Quantity" align="right" />
            <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">Price</th>
            <SortableHeader field="pnl" label="P&L" align="right" />
            <SortableHeader field="date" label="Date" />
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr 
              key={trade.id}
              onClick={() => onTradeClick?.(trade)}
              className="border-b border-white/5 hover:bg-gray-800/30 transition-colors cursor-pointer"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{trade.tradingsymbol}</span>
                  {trade.journal_note && (
                    <div className="group relative">
                      <svg
                        className="w-4 h-4 text-emerald-400 cursor-help"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg z-50 border border-gray-700">
                        <p className="line-clamp-3">{trade.journal_note}</p>
                        {trade.journal_tags && trade.journal_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {trade.journal_tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </td>

              <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                  trade.transaction_type === 'BUY' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {trade.transaction_type === 'BUY' ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  )}
                  {trade.transaction_type}
                </span>
              </td>
              <td className="py-4 px-4">
                {getStrategyBadge(trade)}
              </td>
              <td className="py-4 px-4 text-right text-gray-300">
                {trade.quantity}
              </td>
              <td className="py-4 px-4 text-right text-gray-300">
                {formatINR(trade.average_price || trade.entry_price || 0)}
              </td>
              <td className="py-4 px-4 text-right">
                <PnLIndicator 
                  value={Number(trade.pnl || 0)} 
                  variant="text"
                  size="sm"
                />
              </td>
              <td className="py-4 px-4 text-gray-400 text-sm">
                {trade.trade_date 
                  ? new Date(trade.trade_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'N/A'
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
