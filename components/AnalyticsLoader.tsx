'use client'

import { useEffect, useState } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { shouldLoadAnalytics } from '@/lib/cookies'

export function AnalyticsLoader() {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Only check consent after component mounts (client-side only)
    setIsMounted(true)
    setShouldLoad(shouldLoadAnalytics())
  }, [])

  // Don't render anything during SSR or before mount
  if (!isMounted) {
    return null
  }

  // Only render SpeedInsights if analytics consent is given
  if (!shouldLoad) {
    return null
  }

  return <SpeedInsights />
}

