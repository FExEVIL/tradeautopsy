import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { BrokerConnectorFactory } from '@/lib/brokers/connector-factory'
import { getCurrentProfileId } from '@/lib/profile-utils'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Get broker details
    const { data: broker, error: brokerError } = await supabase
      .from('brokers')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (brokerError || !broker) {
      return NextResponse.json({ error: 'Broker not found' }, { status: 404 })
    }

    if (broker.connection_status !== 'connected') {
      return NextResponse.json(
        { error: 'Broker not connected' },
        { status: 400 }
      )
    }

    // Create connector
    const connector = BrokerConnectorFactory.create(broker.broker_type as any)
    
    // Set credentials
    await connector.connect({
      apiKey: broker.api_key,
      apiSecret: broker.api_secret,
      accessToken: broker.access_token,
      refreshToken: broker.refresh_token,
      tokenExpiresAt: broker.token_expires_at
    })

    // Fetch latest trades (last 30 days)
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 30)

    const trades = await connector.fetchLatestTrades(100)

    // Get current profile (from cookie or default)
    const profileId = await getCurrentProfileId(user.id)

    // Import trades (reuse existing import logic)
    const { data: automationPrefs } = await supabase
      .from('automation_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const preferences = automationPrefs || {
      auto_tag_enabled: true,
      auto_categorize_enabled: true,
      auto_pattern_detection: true
    }

    // Transform trades to include user_id, profile_id, broker_id
    const tradesToImport = trades.map(trade => ({
      ...trade,
      user_id: user.id,
      profile_id: profileId,
      broker_id: broker.id,
      deleted_at: null
    }))

    // Batch insert
    const batchSize = 100
    let totalInserted = 0

    for (let i = 0; i < tradesToImport.length; i += batchSize) {
      const batch = tradesToImport.slice(i, i + batchSize)
      
      const { error, count } = await supabase
        .from('trades')
        .upsert(batch, {
          onConflict: 'user_id,trade_id',
          ignoreDuplicates: true,
          count: 'exact',
        })

      if (error) {
        console.error('Error importing batch:', error)
        continue
      }

      totalInserted += count ?? 0
    }

    // Update broker last_sync_at
    await supabase
      .from('brokers')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', broker.id)

    return NextResponse.json({
      success: true,
      count: totalInserted,
      message: `Successfully imported ${totalInserted} trades`
    })
  } catch (error: any) {
    console.error('Fetch trades error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trades', details: error.message },
      { status: 500 }
    )
  }
}
