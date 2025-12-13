'use client'

import { motion } from 'framer-motion'

interface AnimatedProgressBarProps {
  value: number // 0-100
  className?: string
  barClassName?: string
  showLabel?: boolean
  label?: string
}

export function AnimatedProgressBar({
  value,
  className = '',
  barClassName = '',
  showLabel = false,
  label,
}: AnimatedProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={className}>
      {showLabel && label && (
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${className.includes('h-') ? '' : 'h-2'}`}>
        <motion.div
          className={`h-full rounded-full ${barClassName || 'bg-gradient-to-r from-green-500 to-green-400'}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{
            duration: 1,
            ease: 'easeOut',
            delay: 0.2,
          }}
        />
      </div>
      {showLabel && (
        <div className="text-sm text-green-400 mt-1 font-mono">
          {Math.round(clampedValue)}%
        </div>
      )}
    </div>
  )
}

