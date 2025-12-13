'use client'

import { formatPnLWithSign } from '@/lib/formatters'

interface PnLIndicatorProps {
  value: number
  variant?: 'text' | 'card' | 'badge'
  size?: 'sm' | 'md' | 'lg'
  showSign?: boolean
}

export function PnLIndicator({ 
  value, 
  variant = 'text', 
  size = 'md',
  showSign = true 
}: PnLIndicatorProps) {
  const isProfitable = value >= 0
  
  const colorClasses = {
    text: isProfitable ? 'text-green-500' : 'text-red-500',
    card: isProfitable 
      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
      : 'bg-red-500/10 border-red-500/20 text-red-400',
    badge: isProfitable
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20'
  }
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl'
  }
  
  return (
    <span className={`
      font-mono font-bold
      ${colorClasses[variant]}
      ${sizeClasses[size]}
      ${variant === 'card' ? 'p-4 rounded-lg border' : ''}
      ${variant === 'badge' ? 'px-2 py-0.5 rounded text-xs border' : ''}
    `}>
      {showSign ? formatPnLWithSign(value, size === 'lg') : formatPnLWithSign(value, size === 'lg').replace(/^[+-]/, '')}
    </span>
  )
}
