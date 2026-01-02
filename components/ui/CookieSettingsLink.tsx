'use client'

import { useState } from 'react'
import { CookieSettingsModal } from './CookieSettingsModal'

export function CookieSettingsLink() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="hover:text-white transition-colors"
      >
        Cookie Settings
      </button>
      {showModal && (
        <CookieSettingsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

