'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Lightbulb, Bug, MessageCircle, Star, Send, CheckCircle } from 'lucide-react'

type FeedbackType = 'feature' | 'bug' | 'general' | 'rating'

interface FeedbackWidgetProps {
  className?: string
}

export function FeedbackWidget({ className = '' }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-colors ${className}`}
        aria-label="Send feedback"
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Modal */}
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleClose = () => {
    if (!submitting && !submitted) {
      setType(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {submitted ? (
            <SuccessScreen onClose={handleClose} />
          ) : (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Send Feedback</h2>
                  {!submitting && (
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
                {!type ? (
                  <TypeSelector onSelect={setType} />
                ) : (
                  <FeedbackForm
                    type={type}
                    onBack={() => setType(null)}
                    onSubmit={async (data) => {
                      setSubmitting(true)
                      try {
                        const response = await fetch('/api/feedback', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data),
                        })
                        if (response.ok) {
                          setSubmitted(true)
                        } else {
                          alert('Failed to submit feedback. Please try again.')
                        }
                      } catch (error) {
                        console.error('Feedback submission error:', error)
                        alert('An error occurred. Please try again.')
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                    isSubmitting={submitting}
                  />
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function TypeSelector({ onSelect }: { onSelect: (type: FeedbackType) => void }) {
  const types: Array<{ type: FeedbackType; icon: any; title: string; description: string }> = [
    {
      type: 'feature',
      icon: Lightbulb,
      title: 'Feature Request',
      description: 'Suggest a new feature or improvement',
    },
    {
      type: 'bug',
      icon: Bug,
      title: 'Bug Report',
      description: 'Report a problem or error',
    },
    {
      type: 'general',
      icon: MessageCircle,
      title: 'General Feedback',
      description: 'Share your thoughts or ideas',
    },
    {
      type: 'rating',
      icon: Star,
      title: 'Rate Experience',
      description: 'Tell us how we\'re doing',
    },
  ]

  return (
    <div className="space-y-3">
      <p className="text-gray-400 text-sm mb-6">What would you like to share?</p>
      {types.map(({ type, icon: Icon, title, description }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-emerald-500 hover:bg-gray-800 transition-all text-left"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">{title}</h3>
              <p className="text-gray-400 text-sm">{description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function FeedbackForm({
  type,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  type: FeedbackType
  onBack: () => void
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    importance: 3,
    steps: '',
    expected: '',
    actual: '',
    rating: 5,
    nps: 10,
    likes: '',
    improvements: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      type,
      ...formData,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
    }

    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'feature' && (
        <>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Feature Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the feature"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us more about this feature..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              How important is this? (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, importance: num })}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    formData.importance === num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {type === 'bug' && (
        <>
          <div>
            <label className="block text-sm text-gray-400 mb-2">What happened?</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the bug..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Steps to Reproduce</label>
            <textarea
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Expected Behavior</label>
            <input
              type="text"
              value={formData.expected}
              onChange={(e) => setFormData({ ...formData, expected: e.target.value })}
              placeholder="What should have happened?"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Actual Behavior</label>
            <input
              type="text"
              value={formData.actual}
              onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
              placeholder="What actually happened?"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </>
      )}

      {type === 'general' && (
        <>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Feedback</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Share your thoughts..."
              rows={6}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Satisfaction (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: num })}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    formData.rating === num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {type === 'rating' && (
        <>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              How likely are you to recommend TradeAutopsy? (0-10)
            </label>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 11 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, nps: i })}
                  className={`w-12 py-2 rounded-lg transition-colors ${
                    formData.nps === i
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">What do you like most?</label>
            <textarea
              value={formData.likes}
              onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
              placeholder="Tell us what you love about TradeAutopsy..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">What can we improve?</label>
            <textarea
              value={formData.improvements}
              onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
              placeholder="What would make TradeAutopsy better?"
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </>
      )}

      {/* Optional Email */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Email (optional - for follow-up)
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your@email.com"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Feedback
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-emerald-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Thanks for your feedback!</h3>
      <p className="text-gray-400 mb-6">
        We appreciate you taking the time to help us improve TradeAutopsy.
      </p>
      <button
        onClick={onClose}
        className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
      >
        Close
      </button>
    </div>
  )
}

