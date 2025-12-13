'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Trophy, Sparkles, Share2, X } from 'lucide-react'

interface GoalCelebrationProps {
  goal: {
    id: string
    title: string
    goal_type: string
    target_value: number
    current_value: number
  }
  onClose: () => void
  onShare?: () => void
}

export function GoalCelebration({ goal, onClose, onShare }: GoalCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // Trigger confetti animation
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Goal Achieved: ${goal.title}`,
        text: `I just achieved my trading goal: ${goal.title}!`,
        url: window.location.href
      }).catch(() => {
        // Fallback to copy
        if (onShare) onShare()
      })
    } else if (onShare) {
      onShare()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-br from-green-500/20 to-blue-500/20 border-2 border-green-500/50 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <Trophy className="w-20 h-20 text-yellow-400 animate-bounce" />
              <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Goal Achieved!</h2>
          <p className="text-xl text-green-400 font-semibold mb-4">{goal.title}</p>

          <div className="bg-black/40 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Target: {goal.target_value.toLocaleString()}</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              Achieved: {goal.current_value.toLocaleString()}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Achievement
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  )
}

