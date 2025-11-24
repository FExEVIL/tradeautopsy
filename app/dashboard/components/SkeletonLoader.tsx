export function SkeletonCard() {
  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-800 rounded w-24"></div>
        <div className="w-10 h-10 bg-gray-800 rounded-lg"></div>
      </div>
      <div className="h-8 bg-gray-800 rounded w-32 mb-2"></div>
      <div className="h-4 bg-gray-800 rounded w-40"></div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 animate-pulse">
      <div className="h-6 bg-gray-800 rounded w-48 mb-6"></div>
      <div className="h-64 bg-gray-800 rounded"></div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 animate-pulse">
      <div className="h-6 bg-gray-800 rounded w-48 mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-12 bg-gray-800 rounded flex-1"></div>
            <div className="h-12 bg-gray-800 rounded flex-1"></div>
            <div className="h-12 bg-gray-800 rounded flex-1"></div>
            <div className="h-12 bg-gray-800 rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonInsightCard() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 animate-pulse">
      <div className="w-12 h-12 bg-gray-700 rounded-lg mb-4"></div>
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
      <div className="h-8 bg-gray-700 rounded w-32"></div>
    </div>
  )
}
