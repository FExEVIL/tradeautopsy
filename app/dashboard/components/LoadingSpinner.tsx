export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading your trades...</p>
      </div>
    </div>
  )
}
