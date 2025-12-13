'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { getMarketStatus, formatTimeUntil } from '@/lib/market-status'

export function MarketStatus() {
  const [status, setStatus] = useState(getMarketStatus())
  const [timeUntil, setTimeUntil] = useState<string>('')

  useEffect(() => {
    // Update every minute
    const updateStatus = () => {
      const newStatus = getMarketStatus()
      setStatus(newStatus)
      
      if (newStatus.nextOpen) {
        setTimeUntil(formatTimeUntil(newStatus.nextOpen))
      } else if (newStatus.nextClose) {
        setTimeUntil(formatTimeUntil(newStatus.nextClose))
      } else {
        setTimeUntil('')
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (status.status) {
      case 'open':
        return 'text-green-400'
      case 'closed':
        return 'text-gray-400'
      case 'pre-market':
      case 'post-market':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusBg = () => {
    switch (status.status) {
      case 'open':
        return 'bg-green-500/10 border-green-500/30'
      case 'closed':
        return 'bg-gray-500/10 border-gray-500/30'
      case 'pre-market':
      case 'post-market':
        return 'bg-yellow-500/10 border-yellow-500/30'
      default:
        return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  const StatusIcon = status.isOpen ? TrendingUp : TrendingDown

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusBg()}`}>
      <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {status.message}
        </span>
        {timeUntil && (
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {status.nextOpen ? `Opens in ${timeUntil}` : `Closes in ${timeUntil}`}
          </span>
        )}
      </div>
    </div>
  )
}
