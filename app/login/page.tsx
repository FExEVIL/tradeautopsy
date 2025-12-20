/**
 * Vercel-Style Login Page
 * Pure black theme, optimized, production-ready
 */

'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Github, Shield, Key, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { handleError } from '@/lib/utils/error-handler'

// ============================================
// VALIDATION SCHEMA
// ============================================

const emailSchema = z.string().email('Invalid email address')

// ============================================
// LOGIN FORM COMPONENT
// ============================================

function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate email
      const validatedEmail = emailSchema.parse(email)

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: validatedEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Extract error message from response
        const errorMessage = data.error?.message || data.error || data.message || 'Failed to send verification code'
        throw new Error(errorMessage)
      }

      // Redirect to verification page
      router.push(`/verify?email=${encodeURIComponent(validatedEmail)}`)
    } catch (err) {
      const appError = handleError(err)
      setError(appError.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth' | 'AppleOAuth') => {
    setSsoLoading(provider)
    setError(null)

    try {
      const response = await fetch('/api/auth/oauth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Extract error message from response
        const errorMessage = data.error?.message || data.error || data.message || 'Failed to get authorization URL'
        throw new Error(errorMessage)
      }

      window.location.href = data.authorizationUrl
    } catch (err) {
      const appError = handleError(err)
      setError(appError.message || 'An unexpected error occurred')
      setSsoLoading(null)
    }
  }

  const handleSSOLogin = () => {
    setError('SAML SSO is available for enterprise customers. Please contact support.')
  }

  const handlePasskeyLogin = () => {
    setError('Passkey authentication is coming soon. Please use email or OAuth for now.')
  }

  return (
    <div className="w-full space-y-6">
      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Email Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          required
          disabled={loading}
          className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full px-4 py-3 bg-white hover:bg-[#F5F5F5] disabled:bg-[#1A1A1A] disabled:text-[#6B6B6B] text-black font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending code...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Continue with Email
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1F1F1F]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-black text-[#6B6B6B]">or</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        {/* Google */}
        <button
          onClick={() => handleOAuthLogin('GoogleOAuth')}
          disabled={loading || !!ssoLoading}
          className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#2A2A2A] text-white rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ssoLoading === 'GoogleOAuth' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* GitHub */}
        <button
          onClick={() => handleOAuthLogin('GitHubOAuth')}
          disabled={loading || !!ssoLoading}
          className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#2A2A2A] text-white rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ssoLoading === 'GitHubOAuth' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Github className="w-5 h-5" />
          )}
          Continue with GitHub
        </button>

        {/* SAML SSO */}
        <button
          onClick={handleSSOLogin}
          disabled={loading || !!ssoLoading}
          className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#2A2A2A] text-white rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shield className="w-5 h-5" />
          Continue with SAML SSO
        </button>

        {/* Passkey */}
        <button
          onClick={handlePasskeyLogin}
          disabled={loading || !!ssoLoading}
          className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#2A2A2A] text-white rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Key className="w-5 h-5" />
          Continue with Passkey
        </button>
      </div>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-[#A1A1A1]">
        Don't have an account?{' '}
        <Link href="/signup" className="text-white hover:text-[#A1A1A1] transition-colors underline">
          Sign Up
        </Link>
      </p>
    </div>
  )
}

// ============================================
// PAGE COMPONENT
// ============================================

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-lg">
            <span className="text-xl font-bold text-black">T</span>
          </Link>
          <Link
            href="/signup"
            className="text-sm text-[#737373] hover:text-white transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[360px]">
          <h1 className="text-[28px] font-semibold text-white text-center mb-8 tracking-tight">
            Log in to TradeAutopsy
          </h1>
          
          <Suspense fallback={
            <div className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg animate-pulse" />
          }>
          <LoginForm />
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
