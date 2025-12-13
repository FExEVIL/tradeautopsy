import { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export function ChartCard({ title, children, className = '', action }: ChartCardProps) {
  return (
    <div className={`p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}

