/**
 * Error Boundary Components
 * Error handling with pure black theme and emerald accent
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

// ============================================
// ERROR BOUNDARY CLASS COMPONENT
// ============================================

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

// ============================================
// ERROR FALLBACK COMPONENT
// ============================================

interface ErrorFallbackProps {
  error: Error | null
  onReset?: () => void
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-8 max-w-md w-full text-center">
        <AlertTriangle className="w-12 h-12 text-[#EF4444] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-[#A1A1A1] mb-6">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-3 justify-center">
          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="px-4 py-2 bg-[#141414] hover:bg-[#1A1A1A] text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PAGE ERROR FALLBACK
// ============================================

export function PageErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6">
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-8 max-w-lg w-full text-center">
        <AlertTriangle className="w-16 h-16 text-[#EF4444] mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-3">Page Error</h1>
        <p className="text-[#A1A1A1] mb-8">
          {error.message || 'An error occurred while loading this page'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="px-6 py-3 bg-[#141414] hover:bg-[#1A1A1A] text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ERROR HANDLER HOOK
// ============================================

export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    console.error('Error caught by useErrorHandler:', error)
  }, [])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  React.useEffect(() => {
    if (error) {
      // Log error to error tracking service (e.g., Sentry)
      // logErrorToService(error)
    }
  }, [error])

  return { error, handleError, resetError }
}
