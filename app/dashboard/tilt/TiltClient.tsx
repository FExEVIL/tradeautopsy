'use client'

import React from 'react'
import { 
  AlertTriangle, 
  Brain, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Activity
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

type Props = {
  tiltMetrics: {
    score: number
    streak: number
    revengeCount: number
    rapidFire: number
    recentLossCount: number
  }
}

export default function TiltClient({ tiltMetrics }: Props) {
  const { score } = tiltMetrics
  
  // Determine State
  let status = "Zen Mode"
  let color = "text-green-400"
  let bg = "bg-green-500/10"
  let advice = "You are trading with discipline. Keep sticking to your plan."
  let borderColor = "border-white/10"

  if (score > 30) {
    status = "Caution"
    color = "text-yellow-400"
    bg = "bg-yellow-500/10"
    advice = "Signs of frustration detected. Slow down and review your setup criteria."
    borderColor = "border-yellow-500/30"
  }
  if (score > 70) {
    status = "TILT DETECTED"
    color = "text-red-500"
    bg = "bg-red-500/10"
    advice = "STOP TRADING IMMEDIATELY. You are at high risk of emotional decision making."
    borderColor = "border-red-500/30 animate-pulse"
  }

  // Gauge Data
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ]
  const GAUGE_COLORS = [score > 70 ? '#ef4444' : score > 30 ? '#eab308' : '#22c55e', '#333']

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 space-y-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        <div className="flex items-end justify-between">
           <div>
             <h1 className="text-3xl font-bold text-white">Tilt Assessment</h1>
             <p className="text-gray-400 text-sm mt-1">Real-time emotional state monitoring based on trading patterns.</p>
           </div>
        </div>

        {/* HERO CARD */}
        <div className={`p-8 rounded-2xl border ${borderColor} bg-[#0F0F0F] relative overflow-hidden`}>
           <div className="flex flex-col md:flex-row items-center gap-10">
              
              {/* Gauge */}
              <div className="w-48 h-48 relative flex-shrink-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          startAngle={180}
                          endAngle={0}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                       >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={GAUGE_COLORS[index]} />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                    <span className={`text-4xl font-bold ${color}`}>{score}%</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Tilt Risk</span>
                 </div>
              </div>

              {/* Status Text */}
              <div className="flex-1 text-center md:text-left">
                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${bg} ${color} text-sm font-bold mb-4`}>
                    {score > 70 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    {status}
                 </div>
                 <h2 className="text-2xl font-semibold text-white mb-2">
                   {score > 70 ? "Walk Away From The Screen" : "Mental State Analysis"}
                 </h2>
                 <p className="text-gray-400 max-w-lg">{advice}</p>
              </div>

           </div>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="p-5 bg-[#0F0F0F] border border-white/5 rounded-xl hover:border-white/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                 <span className="text-gray-400 text-xs uppercase">Revenge Trades</span>
                 <Flame className={`w-5 h-5 ${tiltMetrics.revengeCount > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
              </div>
              <div className="text-2xl font-bold text-white">{tiltMetrics.revengeCount}</div>
              <p className="text-xs text-gray-500 mt-1">Trades taken &lt;15m after a loss</p>
           </div>

           <div className="p-5 bg-[#0F0F0F] border border-white/5 rounded-xl hover:border-white/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                 <span className="text-gray-400 text-xs uppercase">Current Loss Streak</span>
                 <Activity className={`w-5 h-5 ${tiltMetrics.streak > 2 ? 'text-red-500' : 'text-gray-600'}`} />
              </div>
              <div className="text-2xl font-bold text-white">{tiltMetrics.streak}</div>
              <p className="text-xs text-gray-500 mt-1">Consecutive losses in a row</p>
           </div>

           <div className="p-5 bg-[#0F0F0F] border border-white/5 rounded-xl hover:border-white/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                 <span className="text-gray-400 text-xs uppercase">Recent Form</span>
                 <Brain className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                 {5 - tiltMetrics.recentLossCount}W / {tiltMetrics.recentLossCount}L
              </div>
              <p className="text-xs text-gray-500 mt-1">Last 5 trades performance</p>
           </div>
        </div>

        {/* ACTIONABLE CHECKLIST */}
        {score > 30 && (
          <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
             <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400" /> Cooldown Protocol
             </h3>
             <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer hover:text-white">
                   <input type="checkbox" className="rounded border-gray-600 bg-transparent focus:ring-0" />
                   <span>Close all charting platforms for 15 minutes</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer hover:text-white">
                   <input type="checkbox" className="rounded border-gray-600 bg-transparent focus:ring-0" />
                   <span>Review your trading plan rules</span>
                </label>
             </div>
          </div>
        )}

      </div>
    </div>
  )
}
