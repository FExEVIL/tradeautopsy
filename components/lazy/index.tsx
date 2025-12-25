/**
 * Lazy-Loaded Components
 * Heavy components loaded on-demand to reduce initial bundle size
 */

'use client'

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '@/components/ui/skeleton'

// ============================================
// CHART COMPONENTS
// ============================================

export const LazyCumulativePnLChart = dynamic(
  () => import('@/app/dashboard/components/CumulativePnLChart').then((mod) => ({ default: mod.CumulativePnLChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export const LazyEquityCurve = dynamic(
  () => import('@/app/dashboard/components/ImprovedEquityCurve').then((mod) => ({ default: mod.ImprovedEquityCurve })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export const LazyPnLByDay = dynamic(
  () => import('@/app/dashboard/components/PnLByDay').then((mod) => ({ default: mod.PnLByDay })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export const LazyTimeOfDayChart = dynamic(
  () => import('@/app/dashboard/components/TimeOfDayChart').then((mod) => ({ default: mod.TimeOfDayChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

// ============================================
// CALENDAR COMPONENT
// ============================================

export const LazyCalendar = dynamic(
  () => import('@/app/dashboard/calendar/CalendarClient').then((mod) => ({ default: mod.default })),
  {
    loading: () => <ChartSkeleton height={600} />,
    ssr: false,
  }
)

// ============================================
// PLACEHOLDER COMPONENTS
// These components don't exist yet - uncomment when implemented
// ============================================

// TODO: Implement PDFExport component at @/components/PDFExport
// export const LazyPDFExport = dynamic(...)

// TODO: Implement CSVImport component at @/components/CSVImport  
// export const LazyCSVImport = dynamic(...)

// TODO: Implement AIChat component at @/components/AIChat
// export const LazyAIChat = dynamic(...)

// TODO: Implement RichTextEditor component at @/components/RichTextEditor
// export const LazyRichTextEditor = dynamic(...)

