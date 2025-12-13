export function JournalTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table Skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-[#111]">
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                DATE
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                SYMBOL
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                SETUP
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                P&L
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                EXECUTION
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <tr
                key={i}
                className={`border-b border-white/5 ${
                  i % 2 === 0 ? 'bg-black/20' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="h-4 bg-white/10 rounded w-20 animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-12 animate-pulse" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 bg-white/10 rounded w-28 animate-pulse" />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="h-4 bg-white/10 rounded w-16 ml-auto animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className="w-4 h-4 bg-white/10 rounded animate-pulse"
                      />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
                    <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-white/10 rounded w-48 animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
          <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
