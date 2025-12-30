'use client'

import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  showSubtitle?: boolean
  href?: string
  className?: string
  onClick?: () => void
}

export function Logo({ 
  size = 'md', 
  showText = true, 
  showSubtitle = false,
  href = '/',
  className = '',
  onClick
}: LogoProps) {
  const sizes = {
    sm: {
      box: 'w-8 h-8',
      text: 'text-lg',
      letter: 'text-base',
      subtitle: 'text-[10px]'
    },
    md: {
      box: 'w-10 h-10',
      text: 'text-xl',
      letter: 'text-lg',
      subtitle: 'text-xs'
    },
    lg: {
      box: 'w-12 h-12',
      text: 'text-2xl',
      letter: 'text-xl',
      subtitle: 'text-sm'
    }
  }

  const s = sizes[size]

  const LogoContent = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Box */}
      <div className={`${s.box} bg-white rounded-xl flex items-center justify-center shadow-lg`}>
        <span className={`text-black font-bold ${s.letter}`}>T</span>
      </div>
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`text-white font-semibold ${s.text} tracking-tight`}>
            TradeAutopsy
          </span>
          {showSubtitle && (
            <span className={`text-gray-500 ${s.subtitle}`}>
              Trading Analytics
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className="hover:opacity-90 transition-opacity">
        <LogoContent />
      </button>
    )
  }

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
