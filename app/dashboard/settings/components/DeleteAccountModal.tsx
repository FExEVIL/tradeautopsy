'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Lock, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'warning' | 'confirm' | 'verify' | 'processing' | 'success'>('warning')
  const [confirmationText, setConfirmationText] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmationText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setStep('verify')
  }

  const handleVerifyAndDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmation: confirmationText,
          password: password || undefined, // Only send if provided
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      setStep('success')
      
      // Redirect to homepage after 3 seconds
      setTimeout(() => {
        // Clear all cookies and localStorage
        document.cookie.split(';').forEach(c => {
          document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
        })
        localStorage.clear()
        router.push('/?deleted=true')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting your account')
      setIsDeleting(false)
      setStep('confirm')
    }
  }

  const handleClose = () => {
    if (step === 'processing' || step === 'success') return
    setStep('warning')
    setConfirmationText('')
    setPassword('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Delete Account</h2>
              {step !== 'processing' && step !== 'success' && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'warning' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white text-center mb-2">
                  Are you sure?
                </h3>
                <p className="text-gray-400 text-sm text-center mb-6">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                  <p className="text-red-400 text-sm font-medium mb-2">What will be deleted:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• All your trades and trading history</li>
                    <li>• Journal entries and notes</li>
                    <li>• Goals and milestones</li>
                    <li>• Trading rules and violations</li>
                    <li>• Audio recordings and screenshots</li>
                    <li>• AI insights and analytics</li>
                    <li>• All personal data and preferences</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Confirm Account Deletion
                  </h3>
                  <p className="text-sm text-gray-400">
                    Type <span className="font-mono text-red-400">DELETE</span> to confirm
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => {
                      setConfirmationText(e.target.value)
                      setError(null)
                    }}
                    placeholder="DELETE"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setStep('warning')
                      setConfirmationText('')
                      setError(null)
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={confirmationText !== 'DELETE'}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Verify Your Identity
                  </h3>
                  <p className="text-sm text-gray-400">
                    Enter your password to confirm account deletion
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setStep('confirm')
                      setPassword('')
                      setError(null)
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyAndDelete}
                    disabled={!password || isDeleting}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Deleting your account...</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Account Deleted Successfully
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Your account and all data have been permanently deleted.
                </p>
                <p className="text-gray-500 text-xs">
                  Redirecting to homepage...
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

