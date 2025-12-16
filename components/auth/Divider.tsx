'use client'

export function Divider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#262626]" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="px-2 bg-black text-[#737373]">OR</span>
      </div>
    </div>
  )
}
