'use client'

import { PatternCard } from '@/app/dashboard/patterns/components/PatternCard'
import { PatternProgress } from '@/app/dashboard/patterns/components/PatternProgress'

interface PatternLibrarySectionProps {
  patterns: any[]
}

export function PatternLibrarySection({ patterns }: PatternLibrarySectionProps) {
  return (
    <div className="space-y-8">
      {/* Pattern Progress Overview */}
      {patterns.length > 0 && (
        <PatternProgress patterns={patterns} />
      )}

      {/* Pattern Cards */}
      {patterns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patterns.map((pattern: any) => (
            <PatternCard key={pattern.type} pattern={pattern} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#0F0F0F] border border-white/5 rounded-2xl">
          <p className="text-gray-400 mb-2">No patterns detected yet</p>
          <p className="text-sm text-gray-500">Keep trading and patterns will be automatically detected</p>
        </div>
      )}
    </div>
  )
}
