import { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: ReactNode
  subtext?: string
  className?: string
  variant?: 'default' | 'hero' | 'small'
}

const variantClasses = {
  default: 'p-6 rounded-xl',
  hero: 'p-8 rounded-2xl',
  small: 'p-4 rounded-lg',
}

export function MetricCard({ 
  label, 
  value, 
  subtext, 
  className = '',
  variant = 'default'
}: MetricCardProps) {
  return (
    <div className={`bg-[#0F0F0F] border border-white/5 ${variantClasses[variant]} ${className}`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-2xl font-mono font-bold text-white">
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-gray-500 mt-1">{subtext}</div>
      )}
    </div>
  )
}

