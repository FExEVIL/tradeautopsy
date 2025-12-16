'use client'

import { useEffect, useState } from 'react'
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals'

export default function PerformanceMonitor() {
  const [vitals, setVitals] = useState<Record<string, Metric>>({})

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    const updateVital = (metric: Metric) => {
      setVitals((prev) => ({ ...prev, [metric.name]: metric }))
    }

    onCLS(updateVital)
    onFCP(updateVital)
    onLCP(updateVital)
    onTTFB(updateVital)
    onINP(updateVital)
  }, [])

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null

  if (Object.keys(vitals).length === 0) {
    return (
      <div className="fixed bottom-4 right-4 p-3 bg-black/80 border border-gray-700 rounded-lg shadow-xl text-xs z-50">
        <p className="text-gray-400">⚡ Waiting for metrics...</p>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/90 border border-gray-700 rounded-lg shadow-xl text-xs z-50 max-w-sm backdrop-blur-sm">
      <h3 className="font-bold mb-3 text-white flex items-center gap-2">
        <span>⚡</span>
        <span>Performance Monitor</span>
      </h3>
      <div className="space-y-2">
        {Object.entries(vitals).map(([name, metric]) => {
          const value = metric.value
          const formatted = name === 'CLS' ? value.toFixed(3) : `${Math.round(value)}ms`
          const rating = getRatingColor(metric.rating)

          return (
            <div key={name} className="flex justify-between items-center py-1 border-b border-gray-800 last:border-0">
              <span className="text-gray-400 font-mono text-[10px]">{name}:</span>
              <span className={`font-semibold ${rating} font-mono`}>{formatted}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${getRatingBg(rating)}`}>
                {metric.rating}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-gray-500 mt-3 pt-2 border-t border-gray-800">
        Development only
      </p>
    </div>
  )
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'good':
      return 'text-green-400'
    case 'needs-improvement':
      return 'text-yellow-400'
    case 'poor':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

function getRatingBg(rating: string): string {
  switch (rating) {
    case 'good':
      return 'bg-green-500/20 text-green-400'
    case 'needs-improvement':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'poor':
      return 'bg-red-500/20 text-red-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}
