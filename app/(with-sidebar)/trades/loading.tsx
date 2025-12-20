import { TradesTableSkeleton } from '@/components/ui/skeleton'

export default function TradesLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-[#0A0A0A] rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-[#0A0A0A] rounded animate-pulse" />
      </div>
      <TradesTableSkeleton rows={10} />
    </div>
  )
}

