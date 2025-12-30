/**
 * Vercel-Style OTP Verification Page
 * Pure black theme, optimized, production-ready
 */

'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { handleError } from '@/lib/utils/error-handler'
import { Logo } from '@/components/ui/Logo'

// ============================================
// OTP INPUT COMPONENT
// ============================================

interface OTPInputProps {
  code: string[]
  onChange: (index: number, value: string) => void
  onKeyDown: (index: number, e: React.KeyboardEvent) => void
  onPaste: (e: React.ClipboardEvent) => void
  disabled: boolean
  error: boolean
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
}

function OTPInput({ code, onChange, onKeyDown, onPaste, disabled, error, inputRefs }: OTPInputProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={index === 0 ? onPaste : undefined}
          disabled={disabled}
          className={`w-12 h-14 text-center text-2xl font-semibold bg-[#0A0A0A] border ${
            error ? 'border-red-500/50' : 'border-[#1F1F1F]'
          } rounded-lg text-white focus:outline-none focus:border-white transition-colors disabled:opacity-50 font-mono`}
        />
      ))}
    </div>
  )
}

// ============================================
// VERIFICATION FORM COMPONENT
// ============================================

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only take last character
    setCode(newCode)
    setError(null)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    if (newCode.every((digit) => digit) && index === 5) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    // Remove any spaces, dashes, or other non-digit characters
    const pastedData = e.clipboardData.getData('text').replace(/[\s-]/g, '').trim()

    if (!/^\d{6}$/.test(pastedData)) {
      setError('Please paste a valid 6-digit code')
      return
    }

    const newCode = pastedData.split('')
    setCode(newCode)
    inputRefs.current[5]?.focus()

    // Auto-verify
    handleVerify(pastedData)
  }

  const handleVerify = async (verificationCode: string) => {
    if (!email) {
      router.push('/login')
      return
    }

    // Ensure code is exactly 6 digits (remove any spaces or dashes)
    const cleanCode = verificationCode.replace(/[\s-]/g, '').trim()
    if (!/^\d{6}$/.test(cleanCode)) {
      setError('Please enter a valid 6-digit code')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: cleanCode, // Send cleaned code
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Extract error message from response
        const errorMessage = data.error?.message || data.error || data.message || 'Invalid code'
        throw new Error(errorMessage)
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      const appError = handleError(err)
      // Provide user-friendly error messages
      let userMessage = appError.message || 'An unexpected error occurred'
      
      // Make error messages more user-friendly
      if (userMessage.includes('Invalid verification code') || userMessage.includes('invalid')) {
        userMessage = 'Invalid verification code. Please check your code and try again.'
      } else if (userMessage.includes('expired')) {
        userMessage = 'Verification code has expired. Please request a new code.'
      } else if (userMessage.includes('not found')) {
        userMessage = 'No verification code found. Please request a new code.'
      } else if (userMessage.includes('rate limit') || userMessage.includes('too many')) {
        userMessage = 'Too many attempts. Please wait a moment and try again.'
      }
      
      setError(userMessage)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || !email) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to resend code')
      }

      setResendTimer(60)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      const appError = handleError(err)
      setError(appError.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-[#A1A1A1] mb-4">No email provided</p>
        <Link
          href="/login"
          className="text-white hover:text-[#A1A1A1] transition-colors underline"
        >
          Back to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-white mb-2">Check your email</h2>
        <p className="text-sm text-[#737373] mb-1">
          If you have an account, we sent a verification code to
        </p>
        <p className="text-sm text-white font-medium mb-6">{email}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* OTP Input */}
      <div>
        <label className="block text-sm font-medium text-[#737373] mb-3 text-center">
          Enter verification code
        </label>
        <OTPInput
          code={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={loading}
          error={!!error}
          inputRefs={inputRefs}
        />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center">
          <Loader2 className="w-6 h-6 text-white animate-spin mx-auto" />
        </div>
      )}

      {/* Resend */}
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-[#737373]">
            Resend code in {resendTimer}s
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-sm text-[#10B981] hover:text-[#059669] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Resend code
          </button>
        )}
      </div>

      {/* Change Email */}
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="w-full text-sm text-[#737373] hover:text-white font-medium transition-colors"
      >
        Use a different email
      </button>

      {/* Back Button */}
      <Link
        href="/login"
        className="flex items-center gap-2 text-[#10B981] hover:text-[#059669] transition-colors mx-auto w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
    </div>
  )
}

// ============================================
// PAGE COMPONENT
// ============================================

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="w-full px-6 h-16 flex items-center justify-start">
          <Logo size="md" showText={true} href="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[360px]">
          <h1 className="text-[28px] font-semibold text-white text-center mb-8 tracking-tight">
            Verification
          </h1>

          <Suspense fallback={
            <div className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg animate-pulse" />
          }>
            <VerifyForm />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6 text-xs text-[#737373]">
          <Link href="/terms" className="hover:text-[#A1A1A1] transition-colors">
            Terms
          </Link>
          <span className="text-[#262626]">|</span>
          <Link href="/privacy" className="hover:text-[#A1A1A1] transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  )
}

