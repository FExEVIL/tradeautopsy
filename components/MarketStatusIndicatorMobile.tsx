'use client'

import { useMarketStatus } from '@/lib/hooks/useMarketStatus'

export function MarketStatusIndicatorMobile() {
  const { isOpen, statusText, nextEvent, nextEventTime } = useMarketStatus()

  const getTimeRemaining = () => {
    if (!nextEventTime) return ''
    const now = new Date()
    const diff = nextEventTime.getTime() - now.getTime()
    if (diff <= 0) return 'Soon'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h`
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <div
      className={`flex items-center gap-2.5 px-3 h-12 rounded-lg border transition-all ${
        isOpen
          ? 'bg-green-500/10 border-green-500/20'
          : 'bg-red-500/10 border-red-500/20'
      }`}
    >
      {/* Small dot - 8px */}
      <div
        className={`w-2 h-2 rounded-full ${
          isOpen ? 'bg-green-500' : 'bg-red-500'
        } animate-pulse`}
        style={{ animationDuration: '2s' }}
      />

      {/* Compact text */}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-white">
          {statusText}
        </span>
        {nextEventTime && (
          <span className="text-[10px] text-gray-500">
            {nextEvent} {getTimeRemaining()}
          </span>
        )}
      </div>
    </div>
  )
}
