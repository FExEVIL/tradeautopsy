'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader2, CheckCircle, X, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface AudioRecorderProps {
  tradeId?: string
  onComplete?: (summary: string) => void
}

export function AudioRecorder({ tradeId, onComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [duration, setDuration] = useState(0)
  const [processingStage, setProcessingStage] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [aiSummary, setAiSummary] = useState<string>('')
  const [autoTags, setAutoTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        
        // Stop timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        
        // AUTO-PROCESS immediately (no manual save button)
        await processAndSaveAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
      
      // Start timer
      timerRef.current = 0
      intervalRef.current = setInterval(() => {
        timerRef.current += 1
        setDuration(timerRef.current)
      }, 1000)
    } catch (err: any) {
      setError('Microphone access denied. Please enable microphone permissions.')
      console.error('Error starting recording:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAndSaveAudio = async (audioBlob: Blob) => {
    if (!audioBlob) return

    setIsProcessing(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please log in to record audio')
        return
      }

      // Step 1: Upload audio to Supabase Storage
      setProcessingStage('Uploading audio...')
      const fileName = `audio-${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-journal')
        .upload(`${user.id}/${fileName}`, audioBlob, {
          contentType: 'audio/webm',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-journal')
        .getPublicUrl(`${user.id}/${fileName}`)

      // Step 2: Transcribe audio
      setProcessingStage('Transcribing audio...')
      let transcribeResponse: Response
      try {
        transcribeResponse = await fetch('/api/audio-journal/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioUrl: publicUrl,
            tradeId: tradeId || null,
            fileName,
            duration: timerRef.current
          })
        })
      } catch (fetchError: any) {
        if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          throw new Error('Network error. Please check your internet connection and try again.')
        }
        throw fetchError
      }

      if (!transcribeResponse.ok) {
        let errorMessage = 'Failed to transcribe audio'
        try {
          const errorData = await transcribeResponse.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          errorMessage = transcribeResponse.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const transcriptData = await transcribeResponse.json()
      const transcriptText = transcriptData.transcript || ''
      setTranscript(transcriptText)

      // Step 3: AI Analysis (auto-tags, goals, mistakes)
      setProcessingStage('Analyzing with AI...')
      let analysisResponse: Response
      try {
        analysisResponse = await fetch('/api/audio-journal/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: transcriptText,
            tradeId: tradeId || null,
          })
        })
      } catch (fetchError: any) {
        console.warn('AI analysis failed, continuing without it:', fetchError)
        // Continue without analysis if it fails
        analysisResponse = null as any
      }

      let analysisData: any = {}
      if (analysisResponse && analysisResponse.ok) {
        analysisData = await analysisResponse.json()
        setAutoTags(analysisData.autoTags || [])
      }

      // Step 4: Auto-save everything
      setProcessingStage('Saving...')
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('trade_id', tradeId || '')
      formData.append('transcript', transcriptText)
      formData.append('summary', analysisData.summary || transcriptText.substring(0, 200))
      formData.append('duration', timerRef.current.toString())
      formData.append('auto_tags', JSON.stringify(analysisData.autoTags || []))
      formData.append('detected_emotions', JSON.stringify(analysisData.emotions || []))
      formData.append('detected_mistakes', JSON.stringify(analysisData.mistakes || []))
      formData.append('suggested_goals', JSON.stringify(analysisData.goals || []))
      formData.append('ai_analysis', JSON.stringify(analysisData))

      const saveResponse = await fetch('/api/audio-journal/save', {
        method: 'POST',
        body: formData,
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save audio journal entry')
      }

      const saveResult = await saveResponse.json()
      setAiSummary(analysisData.summary || saveResult.summary || 'Audio journal saved successfully')

      setIsComplete(true)
      
      // Call completion callback
      if (onComplete && analysisData.summary) {
        setTimeout(() => {
          onComplete(analysisData.summary)
        }, 1500)
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to process audio')
      console.error('Error processing audio:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const reset = () => {
    setAudioBlob(null)
    setTranscript('')
    setAiSummary('')
    setAutoTags([])
    setError(null)
    setIsComplete(false)
    setDuration(0)
    setProcessingStage('')
  }

  if (isComplete) {
    return (
      <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
        <h3 className="font-semibold text-green-400 mb-1">Recording Saved!</h3>
        <p className="text-sm text-gray-400 mb-4">
          AI analysis complete with auto-tags and insights
        </p>
        {autoTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {autoTags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
        {aiSummary && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg text-left">
            <p className="text-sm text-gray-300">{aiSummary}</p>
          </div>
        )}
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition text-white"
        >
          Record Another
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex items-center gap-4">
        {!isRecording && !isProcessing && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-medium"
          >
            <Mic className="w-4 h-4" />
            <span>Record Audio Note</span>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-500 font-mono">{formatTime(duration)}</span>
            </div>
            
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-medium"
            >
              <Square className="w-4 h-4" />
              <span>Stop & Auto-Save</span>
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-400">{processingStage}</p>
              <p className="text-xs text-gray-400">AI is analyzing your recording...</p>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      {!isRecording && !isProcessing && !isComplete && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-purple-400 font-medium mb-1">AI-Powered Auto-Analysis</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>✓ Auto-transcription with Whisper AI</li>
                <li>✓ Auto-tagging for better insights</li>
                <li>✓ Mistake detection & tracking</li>
                <li>✓ Goal suggestions & planning</li>
                <li>✓ Emotion & pattern analysis</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
