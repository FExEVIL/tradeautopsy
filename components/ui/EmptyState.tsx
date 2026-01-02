'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  progress?: {
    current: number
    total: number
    label?: string
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  progress,
  className = '',
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!Icon) return null
    
    if (typeof Icon === 'function') {
      const IconComponent = Icon as LucideIcon
      return (
        <div className="w-20 h-20 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <IconComponent className="w-10 h-10 text-gray-400" />
        </div>
      )
    }
    
    return (
      <div className="w-20 h-20 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
        {Icon}
      </div>
    )
  }

  const renderPrimaryAction = () => {
    if (!primaryAction) return null

    const buttonClass = "px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"

    if (primaryAction.href) {
      return (
        <Link href={primaryAction.href} className={buttonClass}>
          {primaryAction.label}
        </Link>
      )
    }

    return (
      <button onClick={primaryAction.onClick} className={buttonClass}>
        {primaryAction.label}
      </button>
    )
  }

  const renderSecondaryAction = () => {
    if (!secondaryAction) return null

    const linkClass = "text-emerald-400 hover:text-emerald-300 transition-colors text-sm"

    if (secondaryAction.href) {
      return (
        <Link href={secondaryAction.href} className={linkClass}>
          {secondaryAction.label}
        </Link>
      )
    }

    return (
      <button onClick={secondaryAction.onClick} className={linkClass}>
        {secondaryAction.label}
      </button>
    )
  }

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 text-center ${className}`}>
      {renderIcon()}
      
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>

      {progress && (
        <div className="mb-6 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{progress.label || 'Progress'}</span>
            <span className="text-sm text-gray-400">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {renderPrimaryAction()}
        {secondaryAction && (
          <>
            <span className="text-gray-600 hidden sm:inline">or</span>
            {renderSecondaryAction()}
          </>
        )}
      </div>
    </div>
  )
}

