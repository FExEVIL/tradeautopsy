import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const audioBlob = formData.get('audio') as Blob
    const tradeId = formData.get('trade_id') as string
    const transcript = formData.get('transcript') as string
    const summary = formData.get('summary') as string
    const duration = parseInt(formData.get('duration') as string)
    const emotions = formData.get('emotions') as string // JSON string
    const insights = formData.get('insights') as string // JSON string
    const tags = formData.get('tags') as string // JSON string

    if (!audioBlob || !tradeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify trade belongs to user
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .select('id, user_id')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single()

    if (tradeError || !trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Upload audio to Supabase Storage
    const fileName = `${user.id}/${tradeId}/${Date.now()}.webm`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-journals')
      .upload(fileName, audioBlob, {
        contentType: audioBlob.type || 'audio/webm',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Audio Journal] Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload audio: ' + uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-journals')
      .getPublicUrl(fileName)

    // Parse JSON arrays
    let emotionsArray: string[] = []
    let insightsArray: string[] = []
    let tagsArray: string[] = []
    
    try {
      if (emotions) emotionsArray = JSON.parse(emotions)
      if (insights) insightsArray = JSON.parse(insights)
      if (tags) tagsArray = JSON.parse(tags)
    } catch (e) {
      console.warn('[Audio Journal] Failed to parse JSON arrays:', e)
    }

    // Save to database (upsert in case entry already exists)
    // First check if entry exists
    const { data: existingEntry } = await supabase
      .from('audio_journal_entries')
      .select('id')
      .eq('trade_id', tradeId)
      .eq('user_id', user.id)
      .maybeSingle()

    let journalEntry
    let dbError

    if (existingEntry) {
      // Update existing entry
      const { data, error } = await supabase
        .from('audio_journal_entries')
        .update({
          audio_url: publicUrl,
          transcript: transcript || '',
          summary: summary || null,
          duration: duration || 0,
          emotions: emotionsArray,
          insights: insightsArray,
          tags: tagsArray,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingEntry.id)
        .select()
        .single()
      
      journalEntry = data
      dbError = error
    } else {
      // Insert new entry
      const { data, error } = await supabase
        .from('audio_journal_entries')
        .insert({
          user_id: user.id,
          trade_id: tradeId,
          audio_url: publicUrl,
          transcript: transcript || '',
          summary: summary || null,
          duration: duration || 0,
          emotions: emotionsArray,
          insights: insightsArray,
          tags: tagsArray,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      journalEntry = data
      dbError = error
    }

    if (dbError) {
      console.error('[Audio Journal] Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save journal entry: ' + dbError.message }, { status: 500 })
    }

    // Update trade with audio flag
    await supabase
      .from('trades')
      .update({ has_audio_journal: true })
      .eq('id', tradeId)

    return NextResponse.json({
      success: true,
      entry: journalEntry,
    })

  } catch (error: any) {
    console.error('[Audio Journal] Save error:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
