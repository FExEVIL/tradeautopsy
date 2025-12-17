'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from './Input'
import { Button } from './Button'
import { SSOButton } from './SSOButton'
import { Divider } from './Divider'
import { ExpandableOptions } from './ExpandableOptions'
import { OTPInput } from './OTPInput'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      // Move to OTP step
      setStep('code')
      setResendTimer(60) // 60 second cooldown
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-submit when all 6 digits entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleCodeSubmit(newCode.join(''))
    }
  }

  const handleCodeSubmit = async (codeString: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeString }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
      setCode(['', '', '', '', '', ''])
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to resend code')
      }

      setResendTimer(60)
      setCode(['', '', '', '', '', ''])
    } catch (err: any) {
      setError(err.message || 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  const handleSSOLogin = async (provider: string) => {
    setSsoLoading(provider)
    setError(null)

    try {
      const response = await fetch('/api/auth/workos/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get authorization URL')
      }

      const { authorizationUrl } = await response.json()
      window.location.href = authorizationUrl
    } catch (err: any) {
      setError(err.message || 'SSO login failed. Please try again.')
      setSsoLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="w-full px-3 py-2 bg-red-900/70 border border-red-700 rounded-md text-sm text-red-100 text-center">
          {error}
        </div>
      )}

      {step === 'email' ? (
        <>
          {/* Email Step */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              disabled={loading}
            />

            <Button type="submit" variant="primary" loading={loading} disabled={!email}>
              Continue with Email
            </Button>
          </form>
        </>
      ) : (
        <>
          {/* OTP Step */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-white mb-2">
              Check your email
            </h2>
            <p className="text-sm text-[#737373] mb-1">
              We sent a verification code to
            </p>
            <p className="text-sm text-white font-medium mb-6">{email}</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#737373] mb-3 text-center">
                Enter verification code
              </label>
              <OTPInput
                code={code}
                onChange={handleCodeChange}
                disabled={loading}
                error={!!error}
              />
            </div>

            {/* Resend */}
            <div className="text-center mb-4">
              {resendTimer > 0 ? (
                <p className="text-sm text-[#737373]">
                  Resend code in {resendTimer}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm text-green-500 hover:text-green-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend code
                </button>
              )}
            </div>

            {/* Change Email */}
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setCode(['', '', '', '', '', ''])
                setError(null)
              }}
              className="w-full text-sm text-[#737373] hover:text-white font-medium"
            >
              Use a different email
            </button>
          </div>
        </>
      )}

      {/* SSO Options - Only show on email step */}
      {step === 'email' && (
        <>
          {/* Divider - text only, no gradient line */}
          <Divider />

          {/* Primary SSO Options: Google and Apple */}
          <div className="space-y-3">
            <SSOButton
              provider="google"
              loading={ssoLoading === 'GoogleOAuth'}
              disabled={loading || !!ssoLoading}
              onClick={() => handleSSOLogin('GoogleOAuth')}
            />

            <SSOButton
              provider="apple"
              loading={ssoLoading === 'AppleOAuth'}
              disabled={loading || !!ssoLoading}
              onClick={() => handleSSOLogin('AppleOAuth')}
            />
          </div>

          {/* Expandable Options: GitHub, SAML SSO, Passkey */}
          <ExpandableOptions>
            <SSOButton
              provider="github"
              loading={ssoLoading === 'GitHubOAuth'}
              disabled={loading || !!ssoLoading}
              onClick={() => handleSSOLogin('GitHubOAuth')}
            />

            <SSOButton
              provider="saml"
              loading={ssoLoading === 'SAMLSSO'}
              disabled={loading || !!ssoLoading}
              onClick={() => handleSSOLogin('SAMLSSO')}
            />

            <SSOButton
              provider="passkey"
              loading={ssoLoading === 'Passkey'}
              disabled={loading || !!ssoLoading}
              onClick={() => {
                setError('Passkey sign-in is not enabled yet. Please use email or another provider.')
              }}
            />
          </ExpandableOptions>
        </>
      )}

      {/* Sign up link - Only show on email step */}
      {step === 'email' && (
        <div className="text-center text-sm text-[#737373] mt-6">
          Don't have an account?{' '}
          <a
            href="/signup"
            className="text-white hover:text-[#a3a3a3] transition-colors underline"
          >
            Sign up
          </a>
        </div>
      )}
    </div>
  )
}
