/**
 * Dynamic Imports for Heavy Components
 * Reduces initial bundle size and improves FCP/LCP
 */

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Skeleton loaders for better perceived performance
export function ChartSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
      <div className="h-64 bg-gray-800 rounded" />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-gray-900 rounded animate-pulse" />
      ))}
    </div>
  )
}

export function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-900 rounded animate-pulse" />
      ))}
    </div>
  )
}

// Dynamic imports for heavy chart components
export const DynamicCumulativePnLChart = dynamic(
  () => import('@/lib/dynamicImports').then(mod => mod.CumulativePnLChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Charts don't need SSR
  }
)

// Re-export the actual chart component (will be loaded dynamically)
export { CumulativePnLChart } from '@/components/charts/CumulativePnLChart'

// Dynamic import for heavy analytics components
export const DynamicAnalyticsCards = dynamic(
  () => import('@/app/dashboard/components/AnalyticsCards').then(mod => ({ default: mod.AnalyticsCards })),
  {
    loading: () => <CardsSkeleton />,
  }
)

// Dynamic import for trades table
export const DynamicTradesTable = dynamic(
  () => import('@/app/dashboard/components/TradesTable').then(mod => ({ default: mod.TradesTable })),
  {
    loading: () => <TableSkeleton />,
  }
)

// Dynamic import for equity curve chart
export const DynamicEquityCurve = dynamic(
  () => import('@/app/dashboard/components/ImprovedEquityCurve').then(mod => ({ default: mod.ImprovedEquityCurve })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

// Dynamic import for behavioral insights
export const DynamicBehavioralInsights = dynamic(
  () => import('@/app/dashboard/components/BehavioralInsights').then(mod => ({ default: mod.BehavioralInsights })),
  {
    loading: () => <div className="h-48 bg-gray-900 rounded animate-pulse" />,
  }
)

