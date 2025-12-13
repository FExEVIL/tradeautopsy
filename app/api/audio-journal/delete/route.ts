import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tradeId = searchParams.get('trade_id')

    if (!tradeId) {
      return NextResponse.json({ error: 'Trade ID required' }, { status: 400 })
    }

    // Get journal entry to find audio file
    const { data: entry, error: fetchError } = await supabase
      .from('audio_journal_entries')
      .select('audio_url')
      .eq('trade_id', tradeId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !entry) {
      return NextResponse.json({ error: 'Audio journal not found' }, { status: 404 })
    }

    // Extract file path from URL
    const urlParts = entry.audio_url.split('/audio-journals/')
    if (urlParts.length > 1) {
      const filePath = urlParts[1]
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('audio-journals')
        .remove([filePath])

      if (storageError) {
        console.warn('[Audio Journal] Storage delete error:', storageError)
        // Continue to delete DB entry even if storage delete fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('audio_journal_entries')
      .delete()
      .eq('trade_id', tradeId)
      .eq('user_id', user.id)

    if (dbError) {
      return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 })
    }

    // Update trade flag
    await supabase
      .from('trades')
      .update({ has_audio_journal: false })
      .eq('id', tradeId)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Audio Journal] Delete error:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
