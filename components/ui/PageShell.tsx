import { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
}

export function PageShell({ children, maxWidth = '7xl' }: PageShellProps) {
  return (
    <div className={`w-full mx-auto px-6 py-8 ${maxWidthClasses[maxWidth]}`}>
      {children}
    </div>
  )
}

