import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { audioUrl, tradeId, fileName, duration } = await request.json()
    
    if (!audioUrl) {
      return NextResponse.json({ error: 'Audio URL required' }, { status: 400 })
    }

    console.log('[Transcribe] Processing audio for trade:', tradeId)

    // Download audio from Supabase Storage
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio from storage')
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    const audioFile = new File([audioBuffer], fileName || 'audio.webm', { type: 'audio/webm' })

    // Transcribe using OpenAI Whisper
    let transcript = ''
    
    if (process.env.OPENAI_API_KEY) {
      try {
        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: 'whisper-1',
          language: 'en', // Optional: specify language for better accuracy
        })
        
        transcript = transcription.text
        console.log('[Transcribe] Transcription complete, length:', transcript.length)
      } catch (openaiError: any) {
        console.error('[Transcribe] OpenAI error:', openaiError)
        // Fallback: return placeholder if transcription fails
        transcript = 'Audio transcription failed. Please ensure OPENAI_API_KEY is configured correctly.'
      }
    } else {
      transcript = 'Audio transcription requires OpenAI API key. Please set OPENAI_API_KEY environment variable.'
    }

    return NextResponse.json({
      success: true,
      transcript,
      duration: duration || null
    })

  } catch (error: any) {
    console.error('[Transcribe] Error:', error)
    return NextResponse.json(
      { error: 'Transcription failed', details: error.message },
      { status: 500 }
    )
  }
}
