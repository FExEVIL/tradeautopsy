'use client'

import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { Sparkles, Brain, TrendingUp, ArrowRight, Zap } from 'lucide-react'

interface WelcomeStepProps {
  onNext: () => void
  onSkip: () => void
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  const valueProps = [
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Personalized trading insights powered by TAI',
      gradient: 'from-purple-primary/20 to-purple-primary/5',
      iconColor: 'text-purple-primary',
      borderColor: 'border-purple-border',
    },
    {
      icon: TrendingUp,
      title: 'Behavioral Analysis',
      description: 'Identify patterns and improve your psychology',
      gradient: 'from-blue-primary/20 to-blue-primary/5',
      iconColor: 'text-blue-primary',
      borderColor: 'border-blue-border',
    },
    {
      icon: Sparkles,
      title: 'Performance Tracking',
      description: 'Detailed analytics and progress reports',
      gradient: 'from-green-primary/20 to-green-primary/5',
      iconColor: 'text-green-primary',
      borderColor: 'border-green-border',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      {/* Logo */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-6"
      >
        <Logo size="lg" showText={true} showSubtitle={false} href={undefined} />
      </motion.div>

      {/* Welcome heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Welcome to TradeAutopsy
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          Your AI-powered trading journal and analytics platform
        </p>
      </motion.div>

      {/* Value props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {valueProps.map((prop, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`relative bg-gradient-to-b ${prop.gradient} border ${prop.borderColor} rounded-xl p-5 group hover:border-opacity-60 transition-all duration-300`}
          >
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-b ${prop.gradient} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 rounded-xl`} />
            
            <div className="relative">
              <div className={`w-12 h-12 bg-bg-card rounded-xl flex items-center justify-center mb-4 mx-auto border border-border-subtle`}>
                <prop.icon className={`w-6 h-6 ${prop.iconColor}`} />
              </div>
              <h3 className="text-text-primary font-semibold mb-2">{prop.title}</h3>
              <p className="text-text-tertiary text-sm">{prop.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4 justify-center items-center"
      >
        <button
          onClick={onNext}
          className="group relative px-8 py-3 bg-gradient-to-r from-green-primary to-green-hover text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-green-primary/20 hover:shadow-green-primary/40 hover:scale-[1.02]"
        >
          <Zap className="w-4 h-4" />
          Get Started
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 text-text-tertiary hover:text-text-primary transition-colors font-medium"
        >
          Skip for now
        </button>
      </motion.div>
    </motion.div>
  )
}
