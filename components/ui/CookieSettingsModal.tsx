'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, BarChart3, Settings as SettingsIcon, Check } from 'lucide-react'
import { getCookieConsent, setCookieConsent, type CookieConsent } from '@/lib/cookies'

interface CookieSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CookieSettingsModal({ isOpen, onClose }: CookieSettingsModalProps) {
  const [consent, setConsent] = useState<CookieConsent>({
    essential: true,
    analytics: false,
    preferences: false,
    timestamp: Date.now(),
  })

  useEffect(() => {
    if (isOpen) {
      const existing = getCookieConsent()
      if (existing) {
        setConsent(existing)
      }
    }
  }, [isOpen])

  const handleSave = () => {
    setCookieConsent({
      analytics: consent.analytics,
      preferences: consent.preferences,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[101] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Cookie Settings</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <p className="text-gray-400 text-sm">
              Manage your cookie preferences. Essential cookies are required for the platform to function and cannot be disabled.
            </p>

            {/* Essential Cookies */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Essential Cookies</h3>
                    <p className="text-gray-400 text-sm">
                      Required for authentication, security, and core functionality. These cannot be disabled.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center justify-start px-1 cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                  <span className="text-xs text-gray-500">Always On</span>
                </div>
              </div>
              <div className="ml-13 text-xs text-gray-500 space-y-1">
                <p>• Authentication tokens</p>
                <p>• Session management</p>
                <p>• Security features</p>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Analytics Cookies</h3>
                    <p className="text-gray-400 text-sm">
                      Help us understand how you use the platform to improve performance and features.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConsent({ ...consent, analytics: !consent.analytics })}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    consent.analytics ? 'bg-emerald-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      consent.analytics ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="ml-13 text-xs text-gray-500 space-y-1">
                <p>• Page views and navigation</p>
                <p>• Feature usage statistics</p>
                <p>• Performance metrics (Vercel Speed Insights)</p>
              </div>
            </div>

            {/* Preference Cookies */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <SettingsIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Preference Cookies</h3>
                    <p className="text-gray-400 text-sm">
                      Remember your settings and preferences for a better experience.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConsent({ ...consent, preferences: !consent.preferences })}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    consent.preferences ? 'bg-emerald-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      consent.preferences ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="ml-13 text-xs text-gray-500 space-y-1">
                <p>• Theme preference (dark/light)</p>
                <p>• Sidebar state</p>
                <p>• UI preferences</p>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                💡 You can change these settings anytime by clicking "Cookie Settings" in the footer.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-6">
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2"
              >
                <Check size={18} />
                Save Preferences
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

