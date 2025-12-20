/**
 * Skeleton Components
 * Loading placeholders with pure black theme
 */

import { cn } from '@/lib/utils'

// ============================================
// BASE SKELETON
// ============================================

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[#0A0A0A]', className)}
      {...props}
    />
  )
}

// ============================================
// SPECIFIC SKELETONS
// ============================================

export function MetricCardSkeleton() {
  return (
    <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function TradeRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[#1F1F1F]">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24 ml-auto" />
    </div>
  )
}

export function TradesTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-[#1F1F1F]">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24 ml-auto" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TradeRowSkeleton key={i} />
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="w-full" style={{ height: `${height}px` }} />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <ChartSkeleton />
      <TradesTableSkeleton rows={5} />
    </div>
  )
}

export function InsightCardSkeleton() {
  return (
    <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4">
      <Skeleton className="h-5 w-32 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  )
}
