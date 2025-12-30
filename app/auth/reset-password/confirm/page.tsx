'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Key, Loader2 } from 'lucide-react'

function ResetPasswordConfirmForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Listen for auth state changes - Supabase will process the recovery token automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Password Reset] Auth event:', event)
      
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the password reset link and Supabase verified it
        setIsValidSession(true)
        setCheckingSession(false)
      } else if (event === 'SIGNED_IN' && session) {
        // Sometimes it comes as SIGNED_IN with recovery type
        setIsValidSession(true)
        setCheckingSession(false)
      }
    })

    // Also check if there's already a session (user might have valid recovery session)
    const checkExistingSession = async () => {
      // Give Supabase a moment to process URL tokens
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setIsValidSession(true)
      } else {
        // Check if we have hash params (older Supabase format)
        if (typeof window !== 'undefined') {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const type = hashParams.get('type')
          
          if (accessToken && type === 'recovery') {
            // Set session from hash params
            const refreshToken = hashParams.get('refresh_token') || ''
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (!error) {
              setIsValidSession(true)
            } else {
              setError('Invalid or expired reset link. Please request a new one.')
            }
          } else if (!window.location.search.includes('code=') && !accessToken) {
            // No code and no access token - invalid link
            setError('Invalid reset link. Please request a new password reset.')
          }
        }
      }
      setCheckingSession(false)
    }

    checkExistingSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      // Update the password - user should already be authenticated via recovery token
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        console.error('[Password Reset] Update error:', updateError)
        setError(updateError.message)
        setLoading(false)
        return
      }

      // Sign out after password reset so user logs in with new password
      await supabase.auth.signOut()
      
      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?message=Password updated successfully. Please log in.')
      }, 2000)
      
    } catch (err) {
      console.error('[Password Reset] Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col">
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="w-full px-6 h-16 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-lg">
              <span className="text-xl font-bold text-black">T</span>
            </Link>
            <Link
              href="/login"
              className="text-sm text-[#737373] hover:text-white transition-colors"
            >
              Log in
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-[#6B6B6B]">Verifying reset link...</p>
          </div>
        </main>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col">
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="w-full px-6 h-16 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-lg">
              <span className="text-xl font-bold text-black">T</span>
            </Link>
            <Link
              href="/login"
              className="text-sm text-[#737373] hover:text-white transition-colors"
            >
              Log in
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-[360px] text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-[28px] font-semibold text-white text-center mb-8 tracking-tight">
              Password Updated!
            </h1>
            <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-6">
              <p className="text-sm text-green-400 text-center">
                Your password has been reset successfully. Redirecting to login...
              </p>
            </div>
            <Link 
              href="/login" 
              className="text-sm text-[#0070f3] hover:text-[#0761d1] transition-colors"
            >
              Click here if not redirected
            </Link>
          </div>
        </main>
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

  // Error state - invalid/expired link
  if (error && !isValidSession) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col">
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="w-full px-6 h-16 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-lg">
              <span className="text-xl font-bold text-black">T</span>
            </Link>
            <Link
              href="/login"
              className="text-sm text-[#737373] hover:text-white transition-colors"
            >
              Log in
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-[360px] text-center">
            <h1 className="text-[28px] font-semibold text-white text-center mb-8 tracking-tight">
              Invalid Reset Link
            </h1>
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
            <div className="space-y-3">
              <Link 
                href="/auth/reset-password" 
                className="block w-full px-4 py-3 bg-white hover:bg-[#F5F5F5] text-black font-medium rounded-lg transition-colors text-center"
              >
                Request New Reset Link
              </Link>
              <Link 
                href="/login" 
                className="block w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#2A2A2A] text-white rounded-lg transition-colors text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </main>
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

  // Main form - valid session
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-lg">
            <span className="text-xl font-bold text-black">T</span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-[#737373] hover:text-white transition-colors"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[360px]">
          <h1 className="text-[28px] font-semibold text-white text-center mb-8 tracking-tight">
            Set New Password
          </h1>
          
          {error && isValidSession && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              required
              disabled={loading}
              minLength={8}
              autoFocus
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError(null)
              }}
              required
              disabled={loading}
              minLength={8}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={loading || !isValidSession || !password || !confirmPassword}
              className="w-full px-4 py-3 bg-white hover:bg-[#F5F5F5] disabled:bg-[#1A1A1A] disabled:text-[#6B6B6B] text-black font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[#A1A1A1] mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-white hover:text-[#A1A1A1] transition-colors underline">
              Log in
            </Link>
          </p>
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

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <ResetPasswordConfirmForm />
    </Suspense>
  )
}

