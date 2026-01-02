'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Settings } from 'lucide-react'
import { getCookieConsent, setCookieConsent, type CookieConsent } from '@/lib/cookies'
import { CookieSettingsModal } from './CookieSettingsModal'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = getCookieConsent()
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const handleAcceptAll = () => {
    setCookieConsent({
      analytics: true,
      preferences: true,
    })
    setIsVisible(false)
  }

  const handleRejectNonEssential = () => {
    setCookieConsent({
      analytics: false,
      preferences: false,
    })
    setIsVisible(false)
  }

  const handleCustomize = () => {
    setShowSettings(true)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">
                    We use cookies to improve your experience
                  </h3>
                  <p className="text-gray-400 text-sm">
                    We use essential cookies for authentication and security. You can choose to enable analytics and preference cookies to help us improve the platform.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={handleRejectNonEssential}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={handleCustomize}
                    className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Customize
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {showSettings && (
        <CookieSettingsModal
          isOpen={showSettings}
          onClose={() => {
            setShowSettings(false)
            // Hide banner if consent was saved
            if (getCookieConsent()) {
              setIsVisible(false)
            }
          }}
        />
      )}
    </>
  )
}

