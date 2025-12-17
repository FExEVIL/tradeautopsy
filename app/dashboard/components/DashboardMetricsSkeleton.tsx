// ✅ Skeleton components with fixed dimensions to prevent layout shift
export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 p-6 bg-gray-900 rounded-lg border border-gray-800 min-h-[120px]">
        <div className="h-4 bg-gray-800 rounded w-24 mb-4 animate-pulse" />
        <div className="h-10 bg-gray-800 rounded w-32 animate-pulse" />
      </div>
      <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 min-h-[120px]">
        <div className="h-4 bg-gray-800 rounded w-28 mb-4 animate-pulse" />
        <div className="h-10 bg-gray-800 rounded w-24 animate-pulse" />
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 bg-gray-900 rounded-lg border border-gray-800 min-h-[120px]">
          <div className="h-3 bg-gray-800 rounded w-20 mb-3 animate-pulse" />
          <div className="h-8 bg-gray-800 rounded w-24 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-800 rounded w-32 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 min-h-[400px]">
        <div className="h-6 bg-gray-800 rounded w-32 mb-4 animate-pulse" />
        <div className="h-full bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 min-h-[400px]">
        <div className="h-6 bg-gray-800 rounded w-28 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
