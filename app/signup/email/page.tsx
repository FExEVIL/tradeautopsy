'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Input } from '@/components/auth/Input'
import { Button } from '@/components/auth/Button'
import { Eye, EyeOff } from 'lucide-react'

export default function EmailSignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required')
      return false
    }
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Show success message and redirect to login
      // User needs to sign in after creating account
      router.push('/login?signup=success')
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout headerLink={{ text: 'Log in', href: '/login' }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-medium text-white mb-2 tracking-[-0.02em]">
            Sign up with Email
          </h1>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[5px]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            autoComplete="name"
          />

          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <Button type="submit" loading={loading} disabled={loading || !name || !email || !password}>
            Create Account
          </Button>
        </form>

        <p className="text-xs text-[#666666] text-center">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-[#0070f3] hover:text-[#0761d1] transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#0070f3] hover:text-[#0761d1] transition-colors">
            Privacy Policy
          </Link>
        </p>

        <p className="text-center text-sm text-[#a3a3a3]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0070f3] hover:text-[#0761d1] transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
