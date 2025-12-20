'use client'

import { PageErrorFallback } from '@/components/ui/error-boundary'

export default function PerformanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <PageErrorFallback error={error} reset={reset} />
}

