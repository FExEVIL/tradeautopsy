'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/auth/Button'
import { Key } from 'lucide-react'

export default function CreatePasskeyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreatePasskey = async () => {
    setLoading(true)
    setError('')

    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('Passkeys are not supported in this browser')
      }

      // Get challenge from server
      const challengeResponse = await fetch('/api/auth/passkey/challenge')
      const challengeData = await challengeResponse.json()

      if (!challengeResponse.ok) {
        throw new Error(challengeData.error || 'Failed to initialize passkey creation')
      }

      // Create passkey
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(challengeData.challenge, (c: string) => c.charCodeAt(0)),
          rp: {
            name: 'TradeAutopsy',
            id: window.location.hostname,
          },
          user: {
            id: Uint8Array.from(challengeData.userId, (c: string) => c.charCodeAt(0)),
            name: challengeData.userEmail,
            displayName: challengeData.userName || challengeData.userEmail,
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('Failed to create passkey')
      }

      // Send credential to server
      const response = await fetch('/api/auth/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            clientDataJSON: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).clientDataJSON)),
            attestationObject: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).attestationObject)),
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register passkey')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create passkey. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout headerLink={{ text: 'Skip', href: '/dashboard' }}>
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-[28px] font-medium text-white mb-2 tracking-[-0.02em]">
            Create a Passkey
          </h1>
          <p className="text-sm text-[#a3a3a3]">
            Passkeys let you sign in securely without a password using your fingerprint, face, or screen lock.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[5px]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          onClick={handleCreatePasskey}
          loading={loading}
          disabled={loading}
        >
          Create Passkey
        </Button>

        <Link
          href="/dashboard"
          className="block w-full text-center text-sm text-[#a3a3a3] hover:text-white transition-colors"
        >
          Skip for now
        </Link>
      </div>
    </AuthLayout>
  )
}
