import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Check if OpenAI is available
let openai: any = null
try {
  const OpenAI = require('openai').default
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
} catch (e) {
  console.warn('OpenAI package not installed or API key not set')
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const { audio, tradeId } = await request.json()
    
    if (!audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
    }

    console.log('[Audio Journal] Processing audio for trade:', tradeId)

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audio, 'base64')
    
    // Create a File object for OpenAI
    const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' })

    // Transcribe with OpenAI Whisper
    console.log('[Audio Journal] Calling Whisper API...')
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Change to 'hi' for Hindi, 'auto' for auto-detect
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    })

    const transcript = transcription.text
    console.log('[Audio Journal] Transcription:', transcript)

    // Generate AI summary and extract insights
    console.log('[Audio Journal] Generating AI summary...')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a trading journal AI assistant. Analyze the trader's voice note and provide:
1. A concise 1-2 sentence summary
2. Extracted emotions (comma-separated)
3. Key insights or lessons learned
4. Suggested tags

Format your response as JSON:
{
  "summary": "Brief summary here",
  "emotions": ["emotion1", "emotion2"],
  "insights": ["insight1", "insight2"],
  "tags": ["tag1", "tag2"]
}`
        },
        {
          role: 'user',
          content: `Analyze this trading journal entry: "${transcript}"`
        }
      ],
      response_format: { type: 'json_object' },
    })

    const analysis = JSON.parse(completion.choices[0].message.content || '{}')
    console.log('[Audio Journal] AI Analysis:', analysis)

    return NextResponse.json({
      transcript: transcript,
      summary: analysis.summary || '',
      emotions: analysis.emotions || [],
      insights: analysis.insights || [],
      tags: analysis.tags || [],
      duration: transcription.duration || 0,
    })

  } catch (error: any) {
    console.error('[Audio Journal] Transcription error:', error)
    return NextResponse.json(
      { error: 'Transcription failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}
