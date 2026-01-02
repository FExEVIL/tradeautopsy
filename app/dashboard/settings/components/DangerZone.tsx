'use client'

import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { DeleteAccountModal } from './DeleteAccountModal'

export function DangerZone() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <>
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Delete Account</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4">
                  <li>• All your trades and journal entries</li>
                  <li>• Goals and progress tracking</li>
                  <li>• Trading rules and violations</li>
                  <li>• Audio recordings and screenshots</li>
                  <li>• AI insights and analytics</li>
                  <li>• All personal data</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-sm text-red-400 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}

