'use client'

import { useRef, useEffect } from 'react'

interface OTPInputProps {
  code: string[]
  onChange: (index: number, value: string) => void
  onPaste?: (e: React.ClipboardEvent) => void
  disabled?: boolean
  error?: boolean
}

export function OTPInput({ code, onChange, onPaste, disabled, error }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    onChange(index, value)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)

    if (!/^\d+$/.test(pastedData)) return

    const newCode = pastedData.split('')
    while (newCode.length < 6) newCode.push('')

    // Fill all inputs
    newCode.forEach((digit, index) => {
      onChange(index, digit)
    })

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()

    // Call onPaste callback if provided
    if (onPaste) {
      onPaste(e)
    }
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className={`w-12 h-14 text-center text-2xl font-bold bg-black border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-700 focus:ring-green-500 focus:border-green-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  )
}
