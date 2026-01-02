'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, BarChart3, FileText, Brain, Settings, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'

interface TourStepProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export function TourStep({ onNext, onBack, onSkip }: TourStepProps) {
  const [currentHighlight, setCurrentHighlight] = useState(0)

  const highlights = [
    {
      icon: BarChart3,
      title: 'Dashboard Overview',
      description: 'View your total P&L, win rate, and key metrics at a glance',
      tip: 'The dashboard shows your overall trading performance',
      gradient: 'from-blue-primary/30 to-blue-primary/10',
      iconColor: 'text-blue-primary',
      iconBg: 'bg-blue-subtle',
    },
    {
      icon: FileText,
      title: 'Trade Management',
      description: 'See your latest trades and filter by date, symbol, or strategy',
      tip: 'Click on any trade to see detailed information',
      gradient: 'from-purple-primary/30 to-purple-primary/10',
      iconColor: 'text-purple-primary',
      iconBg: 'bg-purple-subtle',
    },
    {
      icon: Brain,
      title: 'TAI - Your AI Coach',
      description: 'Get personalized insights and recommendations from our AI assistant',
      tip: 'TAI analyzes your patterns to help you improve continuously',
      gradient: 'from-green-primary/30 to-green-primary/10',
      iconColor: 'text-green-primary',
      iconBg: 'bg-green-subtle',
    },
    {
      icon: Settings,
      title: 'Smart Navigation',
      description: 'Use the sidebar to access all features and customize your workspace',
      tip: 'Collapse the sidebar for more screen space when needed',
      gradient: 'from-yellow-primary/30 to-yellow-primary/10',
      iconColor: 'text-yellow-primary',
      iconBg: 'bg-yellow-subtle',
    },
  ]

  const current = highlights[currentHighlight]

  const goToNext = () => {
    if (currentHighlight < highlights.length - 1) {
      setCurrentHighlight(currentHighlight + 1)
    }
  }

  const goToPrev = () => {
    if (currentHighlight > 0) {
      setCurrentHighlight(currentHighlight - 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">
          Quick Tour
        </h2>
        <p className="text-text-secondary text-center mb-8">
          Let&apos;s explore the key areas of your dashboard
        </p>
      </motion.div>

      {/* Highlight card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`relative bg-gradient-to-b ${current.gradient} border border-border-subtle rounded-2xl p-8 mb-6 min-h-[300px] flex flex-col items-center justify-center overflow-hidden`}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${current.iconBg} opacity-20 rounded-full blur-3xl`} />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrev}
          disabled={currentHighlight === 0}
          className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-bg-card/80 border border-border-subtle transition-all ${
            currentHighlight === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-border-subtle hover:border-border-default'
          }`}
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>

        <button
          onClick={goToNext}
          disabled={currentHighlight === highlights.length - 1}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-bg-card/80 border border-border-subtle transition-all ${
            currentHighlight === highlights.length - 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-border-subtle hover:border-border-default'
          }`}
        >
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentHighlight}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center relative z-10"
          >
            <div className={`w-20 h-20 ${current.iconBg} rounded-2xl flex items-center justify-center mb-6 mx-auto border border-border-subtle shadow-lg`}>
              <current.icon className={`w-10 h-10 ${current.iconColor}`} />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">{current.title}</h3>
            <p className="text-text-secondary mb-4 max-w-md mx-auto">{current.description}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted bg-bg-card/80 px-4 py-2 rounded-full border border-border-subtle">
              <Lightbulb className="w-4 h-4 text-yellow-primary" />
              <span>{current.tip}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mb-6">
        {highlights.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentHighlight(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentHighlight 
                ? 'bg-gradient-to-r from-green-primary to-green-hover w-8' 
                : 'bg-border-subtle w-2 hover:bg-border-default'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between pt-6 border-t border-border-subtle"
      >
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-2 hover:bg-border-subtle rounded-lg"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="px-5 py-2.5 text-text-tertiary hover:text-text-primary transition-colors font-medium"
          >
            Skip tour
          </button>
          {currentHighlight < highlights.length - 1 ? (
            <button
              onClick={goToNext}
              className="px-6 py-2.5 bg-border-subtle hover:bg-border-default text-text-primary font-semibold rounded-xl transition-all flex items-center gap-2 border border-border-default"
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-6 py-2.5 bg-gradient-to-r from-green-primary to-green-hover text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-green-primary/20 hover:shadow-green-primary/40"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
