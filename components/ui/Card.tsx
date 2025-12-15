import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  variant?: 'base' | 'dark' | 'darker' | 'profit' | 'loss' | 'highlighted'
  className?: string
  onClick?: () => void
}

export function Card({ children, variant = 'base', className, onClick }: CardProps) {
  const variants = {
    base: 'bg-white/5 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all',
    dark: 'bg-[#0F0F0F] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all',
    darker: 'bg-[#0A0A0A] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all',
    profit: 'bg-green-500/10 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all',
    loss: 'bg-red-500/10 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all',
    highlighted: 'bg-white/5 border border-blue-500/30 rounded-xl p-5 shadow-lg shadow-blue-500/10',
  }

  return (
    <div
      className={cn(variants[variant], className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}
