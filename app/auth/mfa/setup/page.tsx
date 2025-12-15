'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Input } from '@/components/auth/Input'
import { Button } from '@/components/auth/Button'

export default function MFASetupPage() {
  const router = useRouter()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch TOTP secret and QR code from API
    const fetchMFASetup = async () => {
      try {
        const response = await fetch('/api/auth/mfa/setup')
        const data = await response.json()

        if (response.ok && data.qrCode && data.secret) {
          setQrCode(data.qrCode)
          setSecret(data.secret)
        } else {
          setError(data.error || 'Failed to initialize MFA setup')
        }
      } catch (err: any) {
        setError('Failed to initialize MFA setup')
      }
    }

    fetchMFASetup()
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, secret }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout headerLink={{ text: 'Skip', href: '/dashboard' }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-medium text-white mb-2 tracking-[-0.02em]">
            Set up two-factor authentication
          </h1>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[5px]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {qrCode ? (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>

            <div>
              <Input
                type="text"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={loading}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button type="submit" loading={loading} disabled={loading || code.length !== 6}>
              Verify and enable
            </Button>
          </form>
        ) : (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-[5px]">
            <p className="text-sm text-yellow-400">Loading QR code...</p>
          </div>
        )}

        <Link
          href="/dashboard"
          className="block w-full text-center text-sm text-[#a3a3a3] hover:text-white transition-colors"
        >
          I'll do this later
        </Link>
      </div>
    </AuthLayout>
  )
}
