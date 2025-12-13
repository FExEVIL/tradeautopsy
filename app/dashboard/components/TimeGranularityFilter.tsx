'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { TimeGranularity } from '@/lib/calculations'

const GRANULARITIES: { value: TimeGranularity; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
]

export function TimeGranularityFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentGranularity = (searchParams.get('granularity') as TimeGranularity) || 'day'

  const handleChange = (granularity: TimeGranularity) => {
    const params = new URLSearchParams(searchParams)
    params.set('granularity', granularity)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-[#0F0F0F] rounded-lg border border-white/5">
      {GRANULARITIES.map(gran => (
        <button
          key={gran.value}
          onClick={() => handleChange(gran.value)}
          className={`
            px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
            ${currentGranularity === gran.value 
              ? 'bg-white text-black shadow-sm' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }
          `}
        >
          {gran.label}
        </button>
      ))}
    </div>
  )
}

