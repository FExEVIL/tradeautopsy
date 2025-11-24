interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  fullScreen?: boolean
}

export function ErrorState({ 
  message = 'Something went wrong', 
  onRetry,
  fullScreen = false 
}: ErrorStateProps) {
  const content = (
    <div className="bg-gradient-to-br from-red-950/50 to-red-900/30 border border-red-500/20 rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-red-900/50 border border-red-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Data</h3>
      <p className="text-gray-400 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {content}
        </div>
      </div>
    )
  }

  return content
}
