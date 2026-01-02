'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export interface AudioJournalData {
  audioBlob: Blob
  transcript: string
  summary: string
  emotions: string[]
  insights: string[]
  tags: string[]
  duration: number
}

interface AudioRecorderProps {
  tradeId: string
  onSave: (audioData: AudioJournalData) => Promise<void>
}

type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unknown'

export function AudioRecorder({ tradeId, onSave }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [emotions, setEmotions] = useState<string[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('unknown')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const supabase = createClient()

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus()
  }, [])

  const checkPermissionStatus = useCallback(async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setPermissionStatus(result.state as PermissionStatus)
        
        const handleChange = () => {
          setPermissionStatus(result.state as PermissionStatus)
          if (result.state === 'granted') {
            setError('')
          }
        }
        
        result.addEventListener('change', handleChange)
        return () => result.removeEventListener('change', handleChange)
      }
    } catch (err) {
      console.log('Permission query not supported')
      setPermissionStatus('unknown')
    }
  }, [])

  const requestMicrophoneAccess = async (): Promise<MediaStream | null> => {
    setError('')

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })

      setPermissionStatus('granted')
      return stream

    } catch (err: any) {
      console.error('Microphone access error:', err)

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied')
        setError('Microphone permission denied. Please click the lock icon in your browser\'s address bar, allow microphone access, then click "Try Again".')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Microphone is being used by another application.')
      } else if (err.name === 'OverconstrainedError') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          setPermissionStatus('granted')
          return stream
        } catch {
          setError('Could not access microphone.')
        }
      } else {
        setError(`Microphone error: ${err.message || 'Unknown error'}`)
      }

      return null
    }
  }

  const startRecording = async () => {
    setError('')
    
    const stream = await requestMicrophoneAccess()
    if (!stream) return

    streamRef.current = stream
    chunksRef.current = []

    // Find supported MIME type
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ]
    
    let selectedMimeType = ''
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType
        break
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType || undefined,
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: chunksRef.current[0]?.type || 'audio/webm',
        })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        await processAudio(audioBlob)
      }

      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error)
        setError('Recording error occurred')
        setIsRecording(false)
      }

      mediaRecorder.start(1000)
      setIsRecording(true)

      timerRef.current = 0
      intervalRef.current = setInterval(() => {
        timerRef.current += 1
        setDuration(timerRef.current)
      }, 1000)

    } catch (err: any) {
      console.error('MediaRecorder creation error:', err)
      setError('Failed to start recording')
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Please log in to record audio')
      }

      // 1) Upload audio to Supabase Storage
      const fileName = `audio-${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-journals')
        .upload(`${user.id}/${fileName}`, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        })

      if (uploadError) {
        console.error('[AudioRecorder] Upload error:', uploadError)
        throw new Error('Failed to upload audio')
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('audio-journals').getPublicUrl(`${user.id}/${fileName}`)

      // 2) Call transcription API
      const response = await fetch('/api/audio-journal/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: publicUrl,
          tradeId,
          fileName,
          duration: timerRef.current,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Transcription failed')
      }

      const data = await response.json()
      const transcriptText = data.transcript || ''
      setTranscript(transcriptText)
      setSummary(data.summary || '')
      setEmotions(data.emotions || [])
      setInsights(data.insights || [])
      setTags(data.tags || [])
    } catch (err: any) {
      setError('Failed to transcribe audio: ' + (err.message || 'Unknown error'))
      console.error('Transcription error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = async () => {
    if (!audioURL) return

    try {
      const audioBlob = await fetch(audioURL).then((r) => r.blob())

      await onSave({
        audioBlob,
        transcript,
        summary,
        emotions,
        insights,
        tags,
        duration: timerRef.current,
      })
    } catch (err: any) {
      setError('Failed to save: ' + (err.message || 'Unknown error'))
      console.error('Save error:', err)
    }
  }

  const retryPermission = async () => {
    setError('')
    setPermissionStatus('unknown')
    await checkPermissionStatus()
    await startRecording()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex items-center gap-4">
        {!isRecording && !audioURL && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
          >
            <Mic className="w-4 h-4" />
            <span>Record Audio Note</span>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-500 font-mono text-sm">{formatTime(duration)}</span>
            </div>

            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
            >
              <Square className="w-4 h-4" />
              <span>Stop Recording</span>
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Transcribing your audio...</span>
          </div>
        )}

        {/* Permission Status Indicator */}
        {permissionStatus === 'granted' && !error && !isRecording && !isProcessing && !audioURL && (
          <span className="inline-flex items-center gap-1 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Microphone ready
          </span>
        )}
      </div>

      {/* Error Message with Retry */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400 font-medium mb-2">{error}</p>
              {permissionStatus === 'denied' && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-400 space-y-1">
                    <p className="font-medium text-gray-300">To fix this:</p>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Click the <strong>lock icon</strong> (🔒) in your browser's address bar</li>
                      <li>Find <strong>"Microphone"</strong> in the permissions</li>
                      <li>Change it to <strong>"Allow"</strong></li>
                      <li>Click the button below</li>
                    </ol>
                  </div>
                  <button
                    onClick={retryPermission}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                  >
                    🔄 Try Again
                  </button>
                </div>
              )}
              {permissionStatus !== 'denied' && (
                <button
                  onClick={() => { setError(''); startRecording(); }}
                  className="mt-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {audioURL && !isProcessing && (
        <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Audio Recording</label>
            <audio src={audioURL} controls className="w-full" />
          </div>

          {summary && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">AI Summary</label>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">{summary}</p>
              </div>
            </div>
          )}

          {(emotions.length > 0 || insights.length > 0 || tags.length > 0) && (
            <div className="space-y-2">
              {emotions.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Emotions</label>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map((emotion, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {transcript && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Transcript (editable)</label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full h-32 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white resize-none focus:outline-none focus:border-blue-500"
                placeholder="Transcript will appear here..."
              />
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!transcript}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
          >
            Save Audio Journal Entry
          </button>
        </div>
      )}
    </div>
  )
}
