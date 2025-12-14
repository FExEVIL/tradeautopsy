'use client'

import { useMarketStatus } from '@/lib/hooks/useMarketStatus'

export function MarketStatusIndicator() {
  const { isOpen, statusText, nextEvent, nextEventTime } = useMarketStatus()

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!nextEventTime) return ''

    const now = new Date()
    const diff = nextEventTime.getTime() - now.getTime()

    if (diff <= 0) return 'Soon'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all ${
        isOpen
          ? 'bg-green-500/10 border-green-500/20'
          : 'bg-red-500/10 border-red-500/20'
      }`}
    >
      {/* Simple Blinking Dot - 8px */}
      <div
        className={`w-2 h-2 rounded-full ${
          isOpen ? 'bg-green-500' : 'bg-red-500'
        } animate-pulse`}
        style={{ animationDuration: '2s' }}
      />

      {/* Status Text */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">
          {statusText}
        </span>
        {nextEventTime && (
          <span className="text-xs text-gray-500">
            {nextEvent} {getTimeRemaining()}
          </span>
        )}
      </div>
    </div>
  )
}
