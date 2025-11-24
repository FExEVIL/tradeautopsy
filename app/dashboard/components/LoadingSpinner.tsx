interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export function LoadingSpinner({ size = 'md', fullScreen = false }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  const spinner = (
    <div className={`${sizes[size]} border-gray-800 border-t-white rounded-full animate-spin`}></div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          {spinner}
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return spinner
}