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
    base: 'bg-bg-card border border-border-subtle rounded-lg p-6 hover:border-border-default transition-colors',
    dark: 'bg-bg-card border border-border-subtle rounded-lg p-6 hover:border-border-default transition-colors',
    darker: 'bg-bg-card border border-border-subtle rounded-lg p-6 hover:border-border-default transition-colors',
    profit: 'bg-green-subtle border border-green-border rounded-lg p-6 hover:border-green-primary transition-colors',
    loss: 'bg-red-subtle border border-red-border rounded-lg p-6 hover:border-red-primary transition-colors',
    highlighted: 'bg-bg-card border border-blue-border rounded-lg p-6 shadow-lg shadow-blue-primary/10',
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
