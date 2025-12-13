'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { format, subDays, startOfYear } from 'date-fns'

const PRESETS = [
  { label: 'Today', value: '1D', getDates: () => ({ start: new Date(), end: new Date() }) },
  { label: '7D', value: '7D', getDates: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: '30D', value: '30D', getDates: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: '90D', value: '90D', getDates: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
  { label: 'YTD', value: 'YTD', getDates: () => ({ start: startOfYear(new Date()), end: new Date() }) },
  { label: '1Y', value: '1Y', getDates: () => ({ start: subDays(new Date(), 365), end: new Date() }) },
  { label: 'All', value: 'ALL', getDates: () => ({ start: new Date('2020-01-01'), end: new Date('2099-12-31') }) }
]

export default function DateRangeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activePreset, setActivePreset] = useState(searchParams.get('range') || '30D')

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset.value)
    const params = new URLSearchParams(searchParams)
    params.set('range', preset.value)
    
    if (preset.value === 'ALL') {
      // For "All", remove date filters to show all trades
      params.delete('start')
      params.delete('end')
    } else {
      const dates = preset.getDates()
      params.set('start', format(dates.start, 'yyyy-MM-dd'))
      params.set('end', format(dates.end, 'yyyy-MM-dd'))
    }
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-[#0F0F0F] rounded-lg border border-white/5">
      {PRESETS.map(preset => (
        <button
          key={preset.value}
          onClick={() => handlePresetClick(preset)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${activePreset === preset.value 
              ? 'bg-white text-black shadow-sm' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }
          `}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
