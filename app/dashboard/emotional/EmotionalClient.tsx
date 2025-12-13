'use client'

import React, { useState } from 'react'
import { 
  AlertCircle, Moon, Zap, Brain
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

type Props = {
  emotionCorrelation: { emotion: string; winRate: number; avgPnL: number; count: number }[]
  sleepCorrelation: { score: number; avgPnL: number; count: number }[]
}

export default function EmotionalClient({ emotionCorrelation, sleepCorrelation }: Props) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [sleepScore, setSleepScore] = useState(3)
  const [focusScore, setFocusScore] = useState(3)

  // Handle empty data gracefully
  const sortedByPnL = [...emotionCorrelation].sort((a,b) => b.avgPnL - a.avgPnL)
  const bestEmotion = sortedByPnL.length > 0 ? sortedByPnL[0] : null
  const worstEmotion = sortedByPnL.length > 0 ? sortedByPnL[sortedByPnL.length - 1] : null

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F0F0F] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-xs text-gray-500 mb-1">{payload[0].payload.emotion}</p>
          <p className="text-sm font-mono font-bold text-white">
            Win Rate: {payload[0].value.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400">
            Avg P&L: ₹{payload[0].payload.avgPnL.toFixed(0)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 space-y-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <div className="flex items-end justify-between">
           <div>
             <h1 className="text-3xl font-bold text-white">Emotional Patterns</h1>
             <p className="text-gray-400 text-sm mt-1">Discover how your psychology impacts your bottom line.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {bestEmotion && (
             <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-3 mb-2">
                   <Zap className="w-5 h-5 text-green-400" />
                   <h3 className="text-green-400 font-bold uppercase text-sm">Peak Performance Zone</h3>
                </div>
                <p className="text-white text-lg">
                   You trade best when you feel <span className="font-bold text-green-400">{bestEmotion.emotion}</span>.
                </p>
             </div>
           )}
           
           {worstEmotion && (
             <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-3 mb-2">
                   <AlertCircle className="w-5 h-5 text-red-400" />
                   <h3 className="text-red-400 font-bold uppercase text-sm">Danger Zone</h3>
                </div>
                <p className="text-white text-lg">
                   Avoid trading when you feel <span className="font-bold text-red-400">{worstEmotion.emotion}</span>.
                </p>
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5 h-[350px]">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                 <Brain className="w-4 h-4 text-purple-500" /> Emotion Impact on Win Rate
              </h2>
              <ResponsiveContainer width="100%" height="85%">
                 <BarChart data={emotionCorrelation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.3} />
                    <XAxis dataKey="emotion" stroke="#666" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`}/>
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                    <Bar dataKey="winRate" radius={[4, 4, 0, 0]} barSize={40}>
                       {emotionCorrelation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.avgPnL > 0 ? '#22c55e' : '#ef4444'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>

           <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5 h-[350px]">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                 <Moon className="w-4 h-4 text-blue-500" /> Sleep Quality vs P&L
              </h2>
              <ResponsiveContainer width="100%" height="85%">
                 <BarChart data={sleepCorrelation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.3} />
                    <XAxis dataKey="score" stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}/5`}/>
                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`}/>
                    <Tooltip cursor={{ fill: '#ffffff05' }} />
                    <Bar dataKey="avgPnL" radius={[4, 4, 0, 0]} barSize={30} fill="#3b82f6" />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  )
}
