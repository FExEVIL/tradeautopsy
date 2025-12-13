'use client'

import dynamic from 'next/dynamic'

const ChartsClient = dynamic(() => import('./ChartsClient'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0a] p-10 flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Loading Charts...</div>
    </div>
  )
})

export default function ChartsWrapper(props: any) {
  return <ChartsClient {...props} />
}
