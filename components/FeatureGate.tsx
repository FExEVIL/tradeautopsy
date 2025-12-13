'use client'

import { ReactNode } from 'react'
import { useFeatureEnabled } from '@/lib/hooks/useFeatureEnabled'
import { FeatureKey } from '@/lib/feature-flags'

interface FeatureGateProps {
  feature: FeatureKey
  children: ReactNode
  fallback?: ReactNode
}

/**
 * FeatureGate component - Conditionally renders children based on enabled features
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const isEnabled = useFeatureEnabled(feature)
  
  if (!isEnabled) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
