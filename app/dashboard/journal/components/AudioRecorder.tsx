'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader2, CheckCircle, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface AudioRecorderProps {
  tradeId?: string
  onComplete?: (summary: string) => void
}

export function AudioRecorder({ tradeId, onComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [aiSummary, setAiSummary] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
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

  const processAudio = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please log in to record audio')
        return
      }

      // Upload audio to Supabase Storage
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

      // Send to API for transcription and summarization
      let response: Response
      try {
        response = await fetch('/api/audio-journal/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioUrl: publicUrl,
            tradeId: tradeId || null,
            fileName
          })
        })
      } catch (fetchError: any) {
        if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          throw new Error('Network error. Please check your internet connection and try again.')
        }
        throw fetchError
      }

      if (!response.ok) {
        let errorMessage = 'Failed to process audio'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setTranscript(result.transcript || '')
      setAiSummary(result.summary || '')

      if (onComplete && result.summary) {
        onComplete(result.summary)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process audio')
      console.error('Error processing audio:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setAudioBlob(null)
    setTranscript('')
    setAiSummary('')
    setError(null)
  }

  useEffect(() => {
    if (audioBlob && !isProcessing) {
      processAudio()
    }
  }, [audioBlob])

  return (
    <div className="space-y-4">
      {!audioBlob ? (
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors animate-pulse"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {isProcessing ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing audio...</span>
            </div>
          ) : (
            <>
              {aiSummary && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      AI Summary
                    </h4>
                    <button
                      onClick={reset}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-300">{aiSummary}</p>
                </div>
              )}
              {transcript && (
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Transcript</h4>
                  <p className="text-sm text-gray-300">{transcript}</p>
                </div>
              )}
            </>
          )}
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
