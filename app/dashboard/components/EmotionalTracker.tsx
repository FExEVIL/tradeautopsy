'use client'

import { useState } from 'react'

interface EmotionalTrackerProps {
  tradeId?: string
  onSave?: (data: EmotionalData) => void
}

export interface EmotionalData {
  mood: string
  sleep_quality: number
  concentration: number
  pre_trade_notes: string
  post_trade_notes: string
}

export function EmotionalTracker({ tradeId, onSave }: EmotionalTrackerProps) {
  const [data, setData] = useState<EmotionalData>({
    mood: 'Neutral',
    sleep_quality: 3,
    concentration: 3,
    pre_trade_notes: '',
    post_trade_notes: ''
  })

  const moods = [
    { 
      value: 'Confident', 
      color: 'text-green-400',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      value: 'Neutral', 
      color: 'text-gray-400',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      value: 'Anxious', 
      color: 'text-yellow-400',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      )
    },
    { 
      value: 'Frustrated', 
      color: 'text-red-400',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white">Emotional State</h3>
      </div>

      {/* Mood Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          How did you feel before this trade?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moods.map(mood => (
            <button
              key={mood.value}
              onClick={() => setData({ ...data, mood: mood.value })}
              className={`p-4 border rounded-lg transition-all ${
                data.mood === mood.value
                  ? 'border-white/30 bg-gray-800/50'
                  : 'border-white/10 bg-black/30 hover:border-white/20'
              }`}
            >
              <div className={`mb-2 flex justify-center ${mood.color}`}>
                {mood.icon}
              </div>
              <div className={`text-sm font-medium ${mood.color}`}>{mood.value}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Quality */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">
            Sleep Quality
          </label>
          <span className="text-sm font-bold text-white">{data.sleep_quality}/5</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={data.sleep_quality}
          onChange={e => setData({ ...data, sleep_quality: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Poor</span>
          <span>Fair</span>
          <span>Good</span>
          <span>Great</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Concentration */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">
            Concentration Level
          </label>
          <span className="text-sm font-bold text-white">{data.concentration}/5</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={data.concentration}
          onChange={e => setData({ ...data, concentration: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Distracted</span>
          <span>Okay</span>
          <span>Focused</span>
          <span>Sharp</span>
          <span>Peak</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Pre-Trade Notes
        </label>
        <textarea
          value={data.pre_trade_notes}
          onChange={e => setData({ ...data, pre_trade_notes: e.target.value })}
          className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
          placeholder="What's your setup? Why are you taking this trade?"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Post-Trade Notes
        </label>
        <textarea
          value={data.post_trade_notes}
          onChange={e => setData({ ...data, post_trade_notes: e.target.value })}
          className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
          placeholder="How did it go? What did you learn?"
          rows={3}
        />
      </div>

      <button
        onClick={() => onSave?.(data)}
        className="w-full px-4 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200"
      >
        Save Emotional Data
      </button>
    </div>
  )
}