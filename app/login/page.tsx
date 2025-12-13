'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      // Success! Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  // WorkOS SSO Login
  const handleSSOLogin = async (provider: string) => {
    setSsoLoading(provider)
    setError('')
    
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
      console.error('SSO login error:', err)
      setError(err.message || 'SSO login failed. Please try again.')
      setSsoLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 group">
        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 border border-gray-300">
          <span className="text-black font-bold text-sm">T</span>
        </div>
        <span className="text-lg font-semibold">TradeAutopsy</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your TradeAutopsy account</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-950/50 to-red-900/30 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all pr-12"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-black/50 border border-white/10 rounded text-white focus:ring-2 focus:ring-white/20"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900/50 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSSOLogin('GoogleOAuth')}
              disabled={loading || !!ssoLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-black/50 border border-white/10 rounded-lg hover:bg-black/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium">
                {ssoLoading === 'GoogleOAuth' ? 'Loading...' : 'Google'}
              </span>
            </button>
            <button
              onClick={() => handleSSOLogin('MicrosoftOAuth')}
              disabled={loading || !!ssoLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-black/50 border border-white/10 rounded-lg hover:bg-black/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span className="text-sm font-medium">
                {ssoLoading === 'MicrosoftOAuth' ? 'Loading...' : 'Microsoft'}
              </span>
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-white hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}