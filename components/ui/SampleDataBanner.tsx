'use client'

import { useState, useEffect } from 'react'
import { Database, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SampleDataBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has sample data
    const checkSampleData = async () => {
      try {
        const response = await fetch('/api/trades?is_sample=true&limit=1')
        if (response.ok) {
          const data = await response.json()
          if (data.trades && data.trades.length > 0) {
            setIsVisible(true)
          }
        }
      } catch (error) {
        console.error('Failed to check sample data:', error)
      }
    }

    checkSampleData()
  }, [])

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all sample data? This cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/trades/clear-sample', {
        method: 'POST',
      })

      if (response.ok) {
        setIsVisible(false)
        router.refresh()
      } else {
        alert('Failed to clear sample data')
      }
    } catch (error) {
      console.error('Failed to clear sample data:', error)
      alert('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Database className="w-5 h-5 text-emerald-400" />
        <div>
          <p className="text-white font-medium text-sm">
            You're viewing sample data
          </p>
          <p className="text-gray-400 text-xs">
            Import your trades to see real insights
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleClear}
          disabled={isLoading}
          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Clearing...' : 'Clear sample data'}
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

