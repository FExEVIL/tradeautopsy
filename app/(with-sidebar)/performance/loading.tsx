import { ChartSkeleton } from '@/components/ui/skeleton'

export default function PerformanceLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-[#0A0A0A] rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-[#0A0A0A] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={400} />
        <ChartSkeleton height={400} />
      </div>
      <ChartSkeleton height={300} />
    </div>
  )
}

