/**
 * Seed script to populate TradeAutopsy with comprehensive mock trading data
 * 
 * Usage:
 *   npx tsx scripts/seed-bogus-data.ts
 * 
 * Or with custom count:
 *   npx tsx scripts/seed-bogus-data.ts 500
 */

import { createClient } from '@supabase/supabase-js'
import { generateMockTrades, getTradeStatistics, MockTrade } from '../lib/seed-data-generator'
import * as fs from 'fs'
import * as path from 'path'

// Get project root directory (works with tsx)
const getProjectRoot = () => {
  // When running with tsx, we can use process.cwd()
  return process.cwd()
}

const projectRoot = getProjectRoot()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const TEST_USER_EMAIL = 'test.trader@tradeautopsy.com'
const TEST_USER_PASSWORD = 'Test@12345'
const DEFAULT_TRADE_COUNT = 300

async function seedDatabase() {
  console.log('🌱 Starting TradeAutopsy Mock Data Seeding...\n')

  // Get trade count from command line or use default
  const tradeCount = process.argv[2] ? parseInt(process.argv[2]) : DEFAULT_TRADE_COUNT
  console.log(`📊 Target: ${tradeCount} trades\n`)

  // Step 1: Create or get test user
  console.log('👤 Step 1: Creating test user...')
  let userId: string

  try {
    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    })

    if (signInData?.user) {
      userId = signInData.user.id
      console.log(`✅ Test user already exists: ${TEST_USER_EMAIL}`)
    } else {
      // Create new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        options: {
          emailRedirectTo: undefined
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          // User exists but password might be wrong, try to get user
          console.log('⚠️  User exists, attempting to reset...')
          // For now, we'll proceed with creating trades for any user
          // In production, you'd handle this differently
          throw new Error('User exists. Please delete the user manually or use different email.')
        }
        throw signUpError
      }

      if (!signUpData.user) {
        throw new Error('Failed to create user')
      }

      userId = signUpData.user.id
      console.log(`✅ Test user created: ${TEST_USER_EMAIL}`)
    }
  } catch (error: any) {
    console.error('❌ Error with user authentication:', error.message)
    console.log('\n💡 Alternative: Use your existing user ID')
    console.log('   You can find your user ID in Supabase Auth > Users')
    console.log('   Then modify this script to use: userId = "your-user-id"')
    process.exit(1)
  }

  // Step 2: Check existing trades
  console.log('\n📋 Step 2: Checking existing trades...')
  const { count: existingCount } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (existingCount && existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing trades for this user`)
    console.log('   Delete existing trades? (y/n) - For now, we\'ll add new ones')
    // In automated script, we'll just add new ones
  }

  // Step 3: Generate mock trades
  console.log('\n🎲 Step 3: Generating mock trading data...')
  const trades = generateMockTrades(userId, tradeCount, Date.now())
  console.log(`✅ Generated ${trades.length} mock trades`)

  // Step 4: Get statistics
  const stats = getTradeStatistics(trades)
  console.log('\n📈 Generated Data Statistics:')
  console.log(JSON.stringify(stats, null, 2))

  // Step 5: Insert trades in batches
  console.log('\n💾 Step 4: Inserting trades into database...')
  const batchSize = 100
  let totalInserted = 0
  let errors = 0

  for (let i = 0; i < trades.length; i += batchSize) {
    const batch = trades.slice(i, i + batchSize)
    
    // Prepare batch for insertion (ensure all required fields are present)
    const batchToInsert = batch.map(trade => ({
      user_id: trade.user_id,
      tradingsymbol: trade.tradingsymbol,
      transaction_type: trade.transaction_type,
      quantity: trade.quantity,
      average_price: trade.average_price,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      trade_date: trade.trade_date,
      pnl: trade.pnl,
      product: trade.product,
      status: trade.status,
      trade_id: trade.trade_id,
      notes: trade.notes,
      journal_note: trade.journal_note || trade.notes,
      tags: trade.tags,
      journal_tags: trade.journal_tags || trade.tags,
      emotion: trade.emotion,
      rating: trade.rating,
      setup_type: trade.setup_type,
      setup: trade.setup,
      mistakes: trade.mistakes,
      execution_rating: trade.execution_rating,
      strategy: trade.strategy
    }))

    const { error, count } = await supabase
      .from('trades')
      .insert(batchToInsert)
      .select()

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
      errors++
    } else {
      totalInserted += count || batch.length
      process.stdout.write(`\r   Progress: ${Math.min(i + batchSize, trades.length)}/${trades.length} trades inserted...`)
    }
  }

  console.log('\n')

  if (errors > 0) {
    console.log(`⚠️  Completed with ${errors} batch errors`)
  } else {
    console.log(`✅ Successfully inserted ${totalInserted} trades!`)
  }

  // Step 6: Set up alert preferences
  console.log('\n⚙️  Step 5: Setting up alert preferences...')
  const { error: prefError } = await supabase
    .from('alert_preferences')
    .upsert({
      user_id: userId,
      tilt_warning_enabled: true,
      avoid_trading_enabled: true,
      best_time_enabled: true,
      take_break_enabled: true,
      notification_frequency: 'normal'
    }, {
      onConflict: 'user_id'
    })

  if (prefError) {
    console.log(`⚠️  Could not set alert preferences: ${prefError.message}`)
  } else {
    console.log('✅ Alert preferences configured')
  }

  // Step 7: Export data to files
  console.log('\n📁 Step 6: Exporting data to files...')
  
  const outputDir = path.join(projectRoot, 'seed-data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Export JSON
  fs.writeFileSync(
    path.join(outputDir, 'seed-data.json'),
    JSON.stringify(trades, null, 2)
  )
  console.log('✅ Exported to seed-data/seed-data.json')

  // Export CSV
  const csvHeaders = [
    'tradingsymbol', 'transaction_type', 'quantity', 'average_price',
    'entry_price', 'exit_price', 'trade_date', 'pnl', 'product', 'status',
    'setup', 'notes', 'tags', 'rating'
  ]
  const csvRows = trades.map(t => [
    t.tradingsymbol,
    t.transaction_type,
    t.quantity,
    t.average_price,
    t.entry_price,
    t.exit_price,
    t.trade_date,
    t.pnl,
    t.product,
    t.status,
    t.setup || '',
    (t.notes || '').replace(/"/g, '""'),
    (t.tags || []).join(';'),
    t.rating || ''
  ])
  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  fs.writeFileSync(path.join(outputDir, 'seed-data.csv'), csvContent)
  console.log('✅ Exported to seed-data/seed-data.csv')

  // Export SQL (for direct database import)
  const sqlStatements = trades.map(trade => {
    const values = [
      `'${trade.user_id}'`,
      `'${trade.tradingsymbol}'`,
      `'${trade.transaction_type}'`,
      trade.quantity,
      trade.average_price,
      trade.entry_price,
      trade.exit_price,
      `'${trade.trade_date}'`,
      trade.pnl,
      `'${trade.product}'`,
      `'${trade.status}'`,
      trade.trade_id ? `'${trade.trade_id}'` : 'NULL',
      trade.notes ? `'${trade.notes.replace(/'/g, "''")}'` : 'NULL',
      trade.tags ? `ARRAY[${trade.tags.map(t => `'${t}'`).join(',')}]` : 'NULL',
      trade.setup ? `'${trade.setup}'` : 'NULL',
      trade.rating || 'NULL'
    ]
    return `INSERT INTO trades (user_id, tradingsymbol, transaction_type, quantity, average_price, entry_price, exit_price, trade_date, pnl, product, status, trade_id, notes, tags, setup_type, rating) VALUES (${values.join(', ')});`
  })

  fs.writeFileSync(
    path.join(outputDir, 'seed-data.sql'),
    sqlStatements.join('\n')
  )
  console.log('✅ Exported to seed-data/seed-data.sql')

  // Step 8: Summary
  console.log('\n' + '='.repeat(60))
  console.log('🎉 SEEDING COMPLETE!')
  console.log('='.repeat(60))
  console.log('\n📋 Test Account Credentials:')
  console.log(`   Email: ${TEST_USER_EMAIL}`)
  console.log(`   Password: ${TEST_USER_PASSWORD}`)
  console.log(`   User ID: ${userId}`)
  console.log('\n📊 Data Summary:')
  console.log(`   Total Trades: ${stats.totalTrades}`)
  console.log(`   Win Rate: ${stats.winRate}%`)
  console.log(`   Net P&L: ₹${stats.totalPnL.toLocaleString()}`)
  console.log(`   Avg Win: ₹${stats.avgWin.toLocaleString()}`)
  console.log(`   Avg Loss: ₹${stats.avgLoss.toLocaleString()}`)
  console.log(`   Revenge Trades: ${stats.revengeTrades}`)
  console.log(`   Overtrading Days: ${stats.overtradingDays}`)
  console.log('\n📁 Exported Files:')
  console.log('   - seed-data/seed-data.json (for API import)')
  console.log('   - seed-data/seed-data.csv (for CSV import)')
  console.log('   - seed-data/seed-data.sql (for direct SQL)')
  console.log('\n✨ Next Steps:')
  console.log('   1. Login with test credentials')
  console.log('   2. Visit /dashboard to see your trades')
  console.log('   3. Check /dashboard/patterns for detected patterns')
  console.log('   4. Test predictive alerts at /dashboard')
  console.log('   5. Review all features with realistic data!')
  console.log('\n')
}

// Run the seed
seedDatabase().catch(error => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})

