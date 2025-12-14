'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = `
    w-full h-11 px-4 rounded-[5px] font-medium text-sm
    transition-all duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
  `

  const variantClasses = {
    primary: `
      bg-[#ffffff] text-black
      hover:bg-[#e6e6e6]
      active:bg-[#d9d9d9]
    `,
    secondary: `
      bg-transparent border border-[#333333] text-white
      hover:bg-[#1a1a1a] hover:border-[#404040]
      active:bg-[#0d0d0d]
    `,
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
