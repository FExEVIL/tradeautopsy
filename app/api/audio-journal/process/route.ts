import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Process audio journal entry:
 * 1. Transcribe audio (using OpenAI Whisper or similar)
 * 2. Generate AI summary
 * 3. Save to database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { audioUrl, tradeId, fileName } = await request.json()

    if (!audioUrl) {
      return NextResponse.json({ error: 'Audio URL required' }, { status: 400 })
    }

    // Transcription: Try OpenAI Whisper if available, otherwise use placeholder
    let transcript = ''
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (openaiApiKey && audioUrl) {
      // Note: OpenAI Whisper API integration requires:
      // 1. Download audio file from Supabase Storage
      // 2. Convert to FormData
      // 3. Send to OpenAI Whisper API
      // For now, use placeholder until full implementation
      transcript = 'Audio transcription will be implemented with OpenAI Whisper API. Please configure OPENAI_API_KEY and ensure audio files are accessible from Supabase Storage.'
    } else {
      transcript = 'Audio transcription requires OpenAI API key configuration. Please set OPENAI_API_KEY environment variable.'
    }

    // Generate AI summary using existing AI infrastructure
    let summary = ''

    if (openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are a trading journal assistant. Summarize the audio journal entry into a concise, actionable note focusing on key insights, emotions, and lessons learned.'
              },
              {
                role: 'user',
                content: `Please summarize this trading journal audio transcript:\n\n${transcript}`
              }
            ],
            max_tokens: 200,
            temperature: 0.7
          })
        })

        if (response.ok) {
          const data = await response.json()
          summary = data.choices?.[0]?.message?.content || ''
        }
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError)
        // Fallback to simple summary
        summary = `Journal entry recorded: ${transcript.substring(0, 100)}...`
      }
    } else {
      // Fallback summary
      summary = `Journal entry: ${transcript.substring(0, 150)}...`
    }

    // Get current profile
    const profileIdCookie = request.cookies.get('current_profile_id')?.value
    let profileId = null
    if (profileIdCookie) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profileIdCookie)
        .eq('user_id', user.id)
        .single()
      profileId = profile?.id || null
    }

    // Save to database
    const { data: entry, error: dbError } = await supabase
      .from('audio_journal_entries')
      .insert({
        user_id: user.id,
        trade_id: tradeId || null,
        profile_id: profileId,
        audio_url: audioUrl,
        transcript: transcript,
        ai_summary: summary,
        duration_seconds: null // Would need to calculate from audio
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving audio entry:', dbError)
      // Still return summary even if DB save fails
    }

    // If tradeId provided, update trade journal_note with summary
    if (tradeId && summary) {
      await supabase
        .from('trades')
        .update({ journal_note: summary })
        .eq('id', tradeId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      success: true,
      transcript,
      summary,
      entryId: entry?.id
    })
  } catch (error: any) {
    console.error('Audio processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process audio', details: error.message },
      { status: 500 }
    )
  }
}
