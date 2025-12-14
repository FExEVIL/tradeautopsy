import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'

/**
 * Save audio journal entry with all AI analysis data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const audio = formData.get('audio') as File
    const tradeId = formData.get('trade_id')?.toString() || null
    const transcript = formData.get('transcript')?.toString() || ''
    const summary = formData.get('summary')?.toString() || ''
    const duration = parseInt(formData.get('duration')?.toString() || '0')
    const autoTags = JSON.parse(formData.get('auto_tags')?.toString() || '[]')
    const detectedEmotions = JSON.parse(formData.get('detected_emotions')?.toString() || '[]')
    const detectedMistakes = JSON.parse(formData.get('detected_mistakes')?.toString() || '[]')
    const suggestedGoals = JSON.parse(formData.get('suggested_goals')?.toString() || '[]')
    const aiAnalysis = JSON.parse(formData.get('ai_analysis')?.toString() || '{}')

    if (!audio) {
      return NextResponse.json({ error: 'Audio file required' }, { status: 400 })
    }

    // Get current profile
    const profileId = await getCurrentProfileId(user.id)

    // Upload audio to Supabase Storage
    const fileName = `audio-${Date.now()}-${audio.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-journal')
      .upload(`${user.id}/${fileName}`, audio, {
        contentType: audio.type,
        upsert: false
      })

    if (uploadError) {
      console.error('[Save] Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-journal')
      .getPublicUrl(`${user.id}/${fileName}`)

    // Save to database with all AI analysis data
    const { data: entry, error: dbError } = await supabase
      .from('audio_journal_entries')
      .insert({
        user_id: user.id,
        profile_id: profileId,
        trade_id: tradeId,
        audio_url: publicUrl,
        transcript: transcript,
        ai_summary: summary,
        duration_seconds: duration,
        auto_tags: autoTags,
        detected_emotions: detectedEmotions,
        detected_mistakes: detectedMistakes,
        suggested_goals: suggestedGoals,
        ai_analysis: aiAnalysis
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Save] Database error:', dbError)
      return NextResponse.json({ 
        error: 'Failed to save audio journal entry',
        details: dbError.message 
      }, { status: 500 })
    }

    // Update trade if tradeId provided
    if (tradeId && summary) {
      await supabase
        .from('trades')
        .update({ 
          journal_note: summary,
          has_audio_journal: true
        })
        .eq('id', tradeId)
        .eq('user_id', user.id)
    }

    console.log('[Save] Audio journal entry saved:', entry?.id)

    return NextResponse.json({
      success: true,
      entryId: entry?.id,
      summary,
      autoTags
    })

  } catch (error: any) {
    console.error('[Save] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save audio journal', details: error.message },
      { status: 500 }
    )
  }
}
