'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Link2, FileText, Plus, Database, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ImportStepProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onComplete: (data: { method: string }) => void
}

export function ImportStep({ onNext, onBack, onSkip, onComplete }: ImportStepProps) {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const importOptions = [
    {
      id: 'zerodha',
      icon: Link2,
      title: 'Connect Zerodha',
      description: 'Securely connect your Zerodha account and import trades automatically',
      gradient: 'from-blue-primary/20 to-blue-primary/5',
      iconBg: 'bg-blue-subtle',
      iconColor: 'text-blue-primary',
      borderColor: 'border-blue-border',
      action: () => {
        router.push('/dashboard/settings/brokers')
        onComplete({ method: 'zerodha' })
      },
    },
    {
      id: 'csv',
      icon: FileText,
      title: 'Import CSV',
      description: 'Upload a CSV file with your trading history',
      gradient: 'from-purple-primary/20 to-purple-primary/5',
      iconBg: 'bg-purple-subtle',
      iconColor: 'text-purple-primary',
      borderColor: 'border-purple-border',
      action: () => {
        router.push('/dashboard/import')
        onComplete({ method: 'csv' })
      },
    },
    {
      id: 'manual',
      icon: Plus,
      title: 'Add Manually',
      description: 'Enter trades one by one',
      gradient: 'from-yellow-primary/20 to-yellow-primary/5',
      iconBg: 'bg-yellow-subtle',
      iconColor: 'text-yellow-primary',
      borderColor: 'border-yellow-border',
      action: () => {
        router.push('/dashboard/manual')
        onComplete({ method: 'manual' })
      },
    },
    {
      id: 'sample',
      icon: Database,
      title: 'Try with Sample Data',
      description: 'Explore TradeAutopsy with demo trades',
      gradient: 'from-green-primary/20 to-green-primary/5',
      iconBg: 'bg-green-subtle',
      iconColor: 'text-green-primary',
      borderColor: 'border-green-border',
      action: async () => {
        setIsLoading(true)
        try {
          const response = await fetch('/api/trades/sample-data', {
            method: 'POST',
          })
          if (response.ok) {
            onComplete({ method: 'sample' })
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('Failed to load sample data:', error)
        } finally {
          setIsLoading(false)
        }
      },
    },
  ]

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
          How would you like to add your trades?
        </h2>
        <p className="text-text-secondary text-center mb-8">
          Choose the method that works best for you
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {importOptions.map((option, i) => {
          const Icon = option.icon
          const isSelected = selectedMethod === option.id
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => {
                setSelectedMethod(option.id)
                option.action()
              }}
              disabled={isLoading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-5 bg-gradient-to-b ${option.gradient} border-2 rounded-xl text-left transition-all duration-300 group ${
                isSelected
                  ? `${option.borderColor} ring-2 ring-offset-2 ring-offset-bg-card ring-green-primary/30`
                  : 'border-border-subtle hover:border-border-default'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-green-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}

              <div className={`w-12 h-12 ${option.iconBg} rounded-xl flex items-center justify-center mb-4 border border-border-subtle group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${option.iconColor}`} />
              </div>
              <h3 className="text-text-primary font-semibold mb-2">{option.title}</h3>
              <p className="text-text-tertiary text-sm">{option.description}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Navigation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
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
            Skip for now
          </button>
          {selectedMethod && (
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
