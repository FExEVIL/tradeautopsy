'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full h-11 px-3 bg-[#171717] border border-[#262626] rounded-md
            text-white text-sm placeholder:text-[#737373]
            focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent
            hover:bg-[#1d1d1d] hover:border-[#404040]
            transition-all
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
