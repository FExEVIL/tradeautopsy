import { MetricCardSkeleton, FormSkeleton } from '@/components/ui/skeleton'

export default function GoalsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-[#0A0A0A] rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-[#0A0A0A] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6">
            <div className="h-6 w-32 bg-[#141414] rounded animate-pulse mb-4" />
            <div className="h-4 w-full bg-[#141414] rounded animate-pulse mb-2" />
            <div className="h-4 w-3/4 bg-[#141414] rounded animate-pulse mb-4" />
            <div className="h-2 w-full bg-[#141414] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

