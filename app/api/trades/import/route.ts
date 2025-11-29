import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { trades } = await request.json()

    const batchSize = 100
    let totalInserted = 0

    for (let i = 0; i < trades.length; i += batchSize) {
      const batch = trades.slice(i, i + batchSize)

      // upsert on (user_id, trade_id) to avoid duplicates
      const { error, count } = await supabase
        .from('trades')
        .upsert(batch, {
          onConflict: 'user_id,trade_id',
          ignoreDuplicates: true,
          count: 'exact',
        })

      if (error) throw error

      // count = rows actually inserted/updated in this batch
      totalInserted += count ?? 0
    }

    // log this import
    await supabase.from('import_logs').insert({
      user_id: user.id,
      source: 'zerodha_tradebook',
      rows_imported: totalInserted,
    })

    return NextResponse.json({ success: true, count: totalInserted })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}

