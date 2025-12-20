/**
 * Lazy-Loaded Components
 * Heavy components loaded on-demand to reduce initial bundle size
 */

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '@/components/ui/skeleton'

// ============================================
// CHART COMPONENTS
// ============================================

export const LazyCumulativePnLChart = dynamic(
  () => import('@/components/charts/CumulativePnLChart').then((mod) => ({ default: mod.CumulativePnLChart })),
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
  () => import('@/app/dashboard/calendar/components/TradeCalendar').then((mod) => ({ default: mod.TradeCalendar })),
  {
    loading: () => <ChartSkeleton height={600} />,
    ssr: false,
  }
)

// ============================================
// PDF EXPORT COMPONENT
// ============================================

export const LazyPDFExport = dynamic(
  () => import('@/components/PDFExport').then((mod) => ({ default: mod.PDFExport })),
  {
    loading: () => <div className="h-10 w-32 bg-[#0A0A0A] rounded animate-pulse" />,
    ssr: false,
  }
)

// ============================================
// CSV IMPORT COMPONENT
// ============================================

export const LazyCSVImport = dynamic(
  () => import('@/components/CSVImport').then((mod) => ({ default: mod.CSVImport })),
  {
    loading: () => <div className="h-10 w-32 bg-[#0A0A0A] rounded animate-pulse" />,
    ssr: false,
  }
)

// ============================================
// AI CHAT COMPONENT
// ============================================

export const LazyAIChat = dynamic(
  () => import('@/components/AIChat').then((mod) => ({ default: mod.AIChat })),
  {
    loading: () => (
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6">
        <div className="h-6 w-32 bg-[#141414] rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#141414] rounded animate-pulse" />
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
)

// ============================================
// RICH TEXT EDITOR
// ============================================

export const LazyRichTextEditor = dynamic(
  () => import('@/components/RichTextEditor').then((mod) => ({ default: mod.RichTextEditor })),
  {
    loading: () => (
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4">
        <div className="h-10 bg-[#141414] rounded animate-pulse mb-2" />
        <div className="h-32 bg-[#141414] rounded animate-pulse" />
      </div>
    ),
    ssr: false,
  }
)

