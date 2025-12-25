'use client'

import { useState, useEffect } from 'react'
import { useMarketStatus } from '@/lib/hooks/useMarketStatus'

export function MarketStatusIndicator() {
  const { isOpen, statusText, nextEvent, nextEventTime } = useMarketStatus()
  const [mounted, setMounted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')

  // Only render time-dependent content after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate time remaining (only on client after mount)
  useEffect(() => {
    if (!mounted || !nextEventTime) {
      setTimeRemaining('')
      return
    }

    const updateTimeRemaining = () => {
      const now = new Date()
      const diff = nextEventTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Soon')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / 1000 / 60)
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${seconds}s`)
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)
    return () => clearInterval(interval)
  }, [mounted, nextEventTime])

  return (
    <div
      className={`flex items-center gap-3 px-4 h-12 rounded-lg border transition-all ${
        isOpen
          ? 'bg-green-subtle border-green-border'
          : 'bg-red-subtle border-red-border'
      }`}
    >
      {/* Simple Blinking Dot - 8px */}
      <div
        className={`w-2 h-2 rounded-full ${
          isOpen ? 'bg-green-primary' : 'bg-red-primary'
        } animate-pulse`}
        style={{ animationDuration: '2s' }}
      />

      {/* Status Text */}
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${
          isOpen ? 'text-green-text' : 'text-red-text'
        }`}>
          {statusText}
        </span>
        {mounted && nextEventTime && timeRemaining && (
          <span className="text-[10px] text-text-muted" suppressHydrationWarning>
            {nextEvent} {timeRemaining}
          </span>
        )}
      </div>
    </div>
  )
}
