export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}
