import { ReactNode } from 'react'

interface ListCardProps {
  title: string
  children: ReactNode
  className?: string
  emptyState?: ReactNode
}

export function ListCard({ title, children, className = '', emptyState }: ListCardProps) {
  return (
    <div className={`p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
      {emptyState}
    </div>
  )
}

