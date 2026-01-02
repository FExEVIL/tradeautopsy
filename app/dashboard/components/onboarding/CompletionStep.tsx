'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Sparkles, ArrowRight, Rocket, TrendingUp, Brain, Target } from 'lucide-react'

interface CompletionStepProps {
  onComplete: () => void
}

export function CompletionStep({ onComplete }: CompletionStepProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger confetti animation (dynamic import for SSR)
    const triggerConfetti = async () => {
      try {
        const confetti = (await import('canvas-confetti')).default
        setShowConfetti(true)
        const duration = 3000
        const animationEnd = Date.now() + duration

        const interval = setInterval(() => {
          if (Date.now() > animationEnd) {
            clearInterval(interval)
            return
          }

          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#22c55e', '#a855f7', '#3b82f6'],
          })
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#22c55e', '#a855f7', '#3b82f6'],
          })
        }, 200)
      } catch (error) {
        console.warn('Failed to load confetti:', error)
      }
    }

    triggerConfetti()
  }, [])

  const nextSteps = [
    { icon: TrendingUp, text: 'Import your trades to see analytics', color: 'text-green-primary' },
    { icon: Target, text: 'Set up trading rules for discipline', color: 'text-blue-primary' },
    { icon: Brain, text: 'Check TAI insights for improvement areas', color: 'text-purple-primary' },
    { icon: Sparkles, text: 'Track your goals and progress', color: 'text-yellow-primary' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center py-6"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex justify-center mb-6"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-green-primary/30 rounded-full blur-2xl animate-pulse" />
          
          {/* Icon container */}
          <div className="relative w-24 h-24 bg-gradient-to-b from-green-primary/30 to-green-primary/10 border border-green-border rounded-full flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-green-primary" />
          </div>

          {/* Floating particles */}
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -20 }}
            transition={{ delay: 0.5, duration: 1.5, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-5 h-5 text-yellow-primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -20 }}
            transition={{ delay: 0.8, duration: 1.5, repeat: Infinity }}
            className="absolute -top-2 -left-2"
          >
            <Sparkles className="w-4 h-4 text-purple-primary" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-text-primary mb-4"
      >
        You&apos;re All Set! 🎉
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-text-secondary text-lg mb-8 max-w-md mx-auto"
      >
        Welcome to TradeAutopsy! You&apos;re ready to start tracking your trades and improving your performance.
      </motion.p>

      {/* What's next card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-b from-purple-primary/10 to-transparent border border-purple-border rounded-2xl p-6 mb-8 max-w-md mx-auto"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-purple-primary" />
          <h3 className="text-text-primary font-semibold">What&apos;s Next?</h3>
        </div>
        <ul className="text-left space-y-3">
          {nextSteps.map((step, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-3 text-text-secondary text-sm"
            >
              <div className="w-8 h-8 bg-bg-card rounded-lg flex items-center justify-center border border-border-subtle flex-shrink-0">
                <step.icon className={`w-4 h-4 ${step.color}`} />
              </div>
              <span>{step.text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={onComplete}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group px-8 py-3.5 bg-gradient-to-r from-green-primary to-green-hover text-white font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto shadow-xl shadow-green-primary/30 hover:shadow-green-primary/50"
      >
        <Rocket className="w-5 h-5" />
        Go to Dashboard
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  )
}
