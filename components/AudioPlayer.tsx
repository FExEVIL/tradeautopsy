'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, ChevronDown, ChevronUp } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  transcript: string
  summary: string
  duration: number
  emotions?: string[]
  tags?: string[]
  onDelete?: () => void
}

export function AudioPlayer({ 
  audioUrl, 
  transcript, 
  summary, 
  duration,
  emotions = [],
  tags = [],
  onDelete
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [audioDuration, setAudioDuration] = useState(duration)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => setIsPlaying(false)
    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration || duration)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [duration])

  return (
    <div className="space-y-3">
      {/* Audio Player */}
      <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-full transition-colors text-white"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%` }}
            />
          </div>
        </div>

        <Volume2 className="w-5 h-5 text-gray-400" />
        
        <audio ref={audioRef} src={audioUrl} />
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-blue-400">AI SUMMARY</span>
          </div>
          <p className="text-sm text-blue-300 mt-1">{summary}</p>
        </div>
      )}

      {/* Emotions & Tags */}
      {(emotions.length > 0 || tags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion, idx) => (
            <span key={`emotion-${idx}`} className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs">
              {emotion}
            </span>
          ))}
          {tags.map((tag, idx) => (
            <span key={`tag-${idx}`} className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Transcript Toggle */}
      {transcript && (
        <div>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showTranscript ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>{showTranscript ? 'Hide' : 'Show'} Transcript</span>
          </button>

          {showTranscript && (
            <div className="mt-2 p-3 bg-black/20 border border-white/10 rounded-lg">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{transcript}</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Delete Audio Journal
        </button>
      )}
    </div>
  )
}
