'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ExpandableOptionsProps {
  children: React.ReactNode
}

export function ExpandableOptions({ children }: ExpandableOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 text-sm text-[#737373] hover:text-[#a3a3a3] transition-colors"
      >
        <span>Show other options</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isExpanded && <div className="space-y-3">{children}</div>}
    </div>
  )
}
