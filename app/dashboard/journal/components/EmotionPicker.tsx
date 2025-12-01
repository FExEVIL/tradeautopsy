'use client'

import { Flame, ShieldAlert, Heart, TrendingUp, Target } from 'lucide-react'
import type { EmotionType } from '@/lib/behavioral/types'

const emotions = [
  { label: 'Revenge', icon: Flame, color: 'text-red-500', description: 'Chasing losses' },
  { label: 'Fear', icon: ShieldAlert, color: 'text-yellow-500', description: 'Hesitant entry' },
  { label: 'Calm', icon: Heart, color: 'text-blue-400', description: 'Rule-based' },
  { label: 'Greedy', icon: TrendingUp, color: 'text-orange-500', description: 'Oversized position' },
  { label: 'Disciplined', icon: Target, color: 'text-green-500', description: 'Plan followed' },
] as const

interface EmotionPickerProps {
  value?: EmotionType
  onChange: (emotion: EmotionType) => void
}

export default function EmotionPicker({ value, onChange }: EmotionPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {emotions.map(({ label, icon: Icon, color, description }) => (
        <button
          key={label}
          onClick={() => onChange(label as EmotionType)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all
            ${value === label 
              ? `border-[#32B8C6] bg-[#32B8C6]/10 ${color}` 
              : 'border-[#3F3F46] bg-[#262628] text-gray-400 hover:border-[#32B8C6]/50'
            }
          `}
          title={description}
        >
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </div>
  )
}
