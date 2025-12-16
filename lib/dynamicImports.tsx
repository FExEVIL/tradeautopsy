'use client'

import dynamic from 'next/dynamic'
import React from 'react'

// ✅ Chart components (heavy - lazy load)
export const DynamicCumulativePnLChart = dynamic(
  () => import('@/app/dashboard/components/CumulativePnLChart').then(mod => ({ default: mod.CumulativePnLChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Charts don't need SSR
  }
)

export const DynamicEquityCurve = dynamic(
  () => import('@/app/dashboard/components/ImprovedEquityCurve').then(mod => ({ default: mod.ImprovedEquityCurve })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export const DynamicMonthlyPnLChart = dynamic(
  () => import('@/app/dashboard/components/MonthlyPnLChart').then(mod => ({ default: mod.MonthlyPnLChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

// ✅ Calendar (heavy - lazy load)
export const DynamicCalendar = dynamic(
  () => import('@/app/dashboard/calendar/CalendarClient'),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false,
  }
)

// ✅ AI Coach (heavy - lazy load)
export const DynamicAICoach = dynamic(
  () => import('@/app/dashboard/components/AICoachCard'),
  {
    loading: () => <AICoachSkeleton />,
    ssr: false,
  }
)

// ✅ Intelligence Dashboard (heavy - lazy load)
export const DynamicIntelligenceDashboard = dynamic(
  () => import('@/app/dashboard/intelligence/IntelligenceDashboard'),
  {
    loading: () => <IntelligenceSkeleton />,
    ssr: false,
  }
)

// ✅ Audio Recorder (only needed on demand)
export const DynamicAudioRecorder = dynamic(
  () => import('@/components/AudioRecorder'),
  {
    loading: () => (
      <div className="p-4 text-center text-gray-400">
        Loading recorder...
      </div>
    ),
    ssr: false,
  }
)

// ✅ Skeleton components
function ChartSkeleton() {
  return (
    <div className="w-full h-64 bg-gray-900 rounded-lg animate-pulse" />
  )
}

function CalendarSkeleton() {
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg animate-pulse" />
  )
}

function AICoachSkeleton() {
  return (
    <div className="w-full h-80 bg-gray-900 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading AI Coach...</div>
    </div>
  )
}

function IntelligenceSkeleton() {
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading Intelligence Dashboard...</div>
    </div>
  )
}
