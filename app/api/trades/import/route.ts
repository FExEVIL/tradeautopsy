import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { applyAutomation } from '@/lib/automation'
import { validateTradeAgainstRules, logRuleViolation } from '@/lib/rule-engine'
import { processTradesWithPnL, TradeData, calculateSingleTradePnL } from '@/lib/pnl-calculator'
import { detectCSVFormat, parseCSVWithMapping } from '@/lib/csv-auto-detector'
import { calculatePnL, calculateTotalPnL, type TradeRow } from '@/lib/pnl-calculator'

export async function POST(request: NextRequest) {
  try {
    // Verify imports are available
    console.log('[Import Route] Checking imports...')
    console.log('[Import Route] detectCSVFormat:', typeof detectCSVFormat)
    console.log('[Import Route] parseCSVWithMapping:', typeof parseCSVWithMapping)
    console.log('[Import Route] calculatePnL:', typeof calculatePnL)
    console.log('[Import Route] calculateTotalPnL:', typeof calculateTotalPnL)
    
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if this is a file upload (FormData) or JSON
    const contentType = request.headers.get('content-type') || ''
    let trades: any[] = []
    let profileId: string | null = null
    let detectedFormat: any = null
    let isCSVImport = false // Flag to track CSV imports

    // Check for FormData (multipart/form-data with boundary)
    // Note: Browser sets Content-Type as "multipart/form-data; boundary=..." so we check for "multipart"
    const isFormData = contentType.includes('multipart/form-data')
    
    if (isFormData) {
      // Handle CSV file upload
      isCSVImport = true
      console.log('========== CSV IMPORT STARTED ==========')
      
      try {
        const formData = await request.formData()
      const file = formData.get('file') as File | null
      const profileIdForm = formData.get('profile_id')
      profileId = profileIdForm ? String(profileIdForm) : null

      if (!file) {
        console.error('[CSV Import] No file in FormData')
        return NextResponse.json({ 
          error: 'No file uploaded. Please select a CSV file.',
          receivedFields: Array.from(formData.keys())
        }, { status: 400 })
      }

      console.log('[CSV Import] File received:', {
        name: file.name,
        size: file.size,
        type: file.type,
        profileId: profileId || 'none'
      })

      let csvContent: string
      try {
        csvContent = await file.text()
        console.log('[CSV Import] File content length:', csvContent.length)
        console.log('[CSV Import] First 200 chars:', csvContent.substring(0, 200))
      } catch (readError: any) {
        console.error('[CSV Import] Error reading file:', readError)
        return NextResponse.json({ 
          error: 'Failed to read CSV file: ' + (readError.message || 'Unknown error')
        }, { status: 400 })
      }
      
      // Auto-detect CSV format
      try {
        console.log('[CSV Import] Starting format detection...')
        console.log('[CSV Import] CSV content length:', csvContent.length)
        console.log('[CSV Import] detectCSVFormat type:', typeof detectCSVFormat)
        
        if (typeof detectCSVFormat !== 'function') {
          const errorMsg = 'detectCSVFormat is not a function. Type: ' + typeof detectCSVFormat
          console.error('[CSV Import]', errorMsg)
          throw new Error(errorMsg)
        }
        
        detectedFormat = detectCSVFormat(csvContent)
        console.log('[CSV Import] ✓ Format detected:', detectedFormat.broker)
        console.log('[CSV Import] ✓ Confidence:', detectedFormat.confidence + '%')
        
        if (detectedFormat.confidence < 50) {
          return NextResponse.json({ 
            error: 'Could not detect CSV format. Please ensure CSV has date, symbol, quantity, and price columns.',
            detected: detectedFormat.mapping 
          }, { status: 400 })
        }
      } catch (detectError: any) {
        const fullErrorMessage = detectError?.message || String(detectError) || 'Unknown error'
        console.error('[CSV Import] CSV detection error:', fullErrorMessage)
        console.error('[CSV Import] Error details:', {
          message: detectError?.message,
          stack: detectError?.stack,
          name: detectError?.name,
          errorString: String(detectError),
          errorJSON: detectError ? JSON.stringify(detectError, Object.getOwnPropertyNames(detectError)) : 'null',
          errorType: typeof detectError,
          errorKeys: detectError ? Object.keys(detectError) : []
        })
        
        // Return full error message (not truncated)
        return NextResponse.json({ 
          error: 'Failed to detect CSV format',
          message: fullErrorMessage,
          details: process.env.NODE_ENV === 'development' ? {
            message: detectError?.message,
            stack: detectError?.stack,
            name: detectError?.name
          } : undefined
        }, { status: 400 })
      }

      // Parse CSV with detected mapping
      try {
        console.log('[CSV Import] Parsing CSV with mapping...')
        const parsedTrades = parseCSVWithMapping(csvContent, detectedFormat.mapping)
        console.log('[CSV Import] ✓ Parsed trades:', parsedTrades.length)
        
        if (parsedTrades.length === 0) {
          console.error('[CSV Import] No trades parsed from CSV')
          return NextResponse.json({ error: 'No valid trades found in CSV' }, { status: 400 })
        }

        // Calculate P&L for all trades
        console.log('[CSV Import] Calculating P&L...')
        const tradesWithPnL = calculatePnL(parsedTrades as TradeRow[])
        const summary = calculateTotalPnL(tradesWithPnL)
        console.log('[CSV Import] ✓ P&L calculated:', summary)
        
        // Debug: Show sample trades with P&L
        const sampleWithPnL = tradesWithPnL.find(t => t.net_pnl !== null && t.net_pnl !== 0)
        const sampleWithoutPnL = tradesWithPnL.find(t => t.net_pnl === null)
        console.log('Sample trade WITH P&L:', sampleWithPnL ? {
          symbol: sampleWithPnL.symbol,
          trade_type: sampleWithPnL.trade_type,
          price: sampleWithPnL.price,
          quantity: sampleWithPnL.quantity,
          pnl: sampleWithPnL.pnl,
          net_pnl: sampleWithPnL.net_pnl,
          charges: sampleWithPnL.charges,
          entry_price: sampleWithPnL.entry_price,
          exit_price: sampleWithPnL.exit_price,
        } : 'NONE FOUND')
        console.log('Sample trade WITHOUT P&L (open position):', sampleWithoutPnL ? {
          symbol: sampleWithoutPnL.symbol,
          trade_type: sampleWithoutPnL.trade_type,
        } : 'NONE')

        // Convert to database format - CRITICAL: Preserve calculated P&L
        trades = tradesWithPnL.map(trade => {
          // Validate and normalize trade_date to ensure it's in YYYY-MM-DD format
          let tradeDate = trade.trade_date
          if (tradeDate) {
            // Ensure date is in YYYY-MM-DD format
            const dateMatch = tradeDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!dateMatch) {
              // Try to parse and reformat
              try {
                const parsed = new Date(tradeDate);
                if (!isNaN(parsed.getTime())) {
                  const year = parsed.getFullYear();
                  const month = parsed.getMonth() + 1;
                  const day = parsed.getDate();
                  tradeDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                } else {
                  console.warn(`[CSV Import] Invalid date format: ${tradeDate}, skipping trade`);
                  return null; // Skip this trade
                }
              } catch (e) {
                console.warn(`[CSV Import] Date parsing error for: ${tradeDate}, skipping trade`);
                return null; // Skip this trade
              }
            }
          } else {
            console.warn(`[CSV Import] Missing trade_date, skipping trade`);
            return null; // Skip this trade
          }
          
          const dbTrade: any = {
            trade_date: tradeDate,
            symbol: trade.symbol,
            tradingsymbol: trade.symbol, // For compatibility
            quantity: trade.quantity,
            price: (trade as any).price || (trade as any).average_price || 0, // Use average_price as fallback
            average_price: (trade as any).price || (trade as any).average_price || 0, // Also set average_price
            transaction_type: trade.trade_type,
            trade_type: trade.trade_type,
            instrument_type: trade.instrument_type || 'EQUITY', // Default to EQUITY if not specified
            charges: trade.charges || 0,
            entry_price: trade.entry_price || null,
            exit_price: trade.exit_price || null,
            segment: trade.segment || 'NSE',
            lot_size: trade.lot_size || 1,
          }
          
          // CRITICAL: Set P&L - use net_pnl (after charges) for the pnl column
          if (trade.net_pnl !== null && trade.net_pnl !== undefined) {
            dbTrade.pnl = parseFloat(trade.net_pnl.toFixed(2))
            dbTrade.pnl_percentage = trade.price > 0 
              ? parseFloat(((trade.net_pnl / (trade.price * trade.quantity)) * 100).toFixed(2))
              : 0
          } else {
            // Open position - no P&L yet
            dbTrade.pnl = null
            dbTrade.pnl_percentage = null
          }
          
          return dbTrade
        }).filter((t: any) => t !== null) // Remove any null trades (invalid dates)

        console.log('✓ Prepared for insert:', trades.length)
        
        // Debug: Count trades with P&L
        const tradesWithPnLCount = trades.filter((t: any) => t.pnl !== null && t.pnl !== 0).length
        const tradesWithoutPnLCount = trades.filter((t: any) => t.pnl === null || t.pnl === 0).length
        console.log(`✓ Trades with P&L: ${tradesWithPnLCount}, Open positions: ${tradesWithoutPnLCount}`)
        
        // Show multiple samples
        const samplesWithPnL = trades.filter((t: any) => t.pnl !== null && t.pnl !== 0).slice(0, 3)
        console.log('Sample trades WITH P&L to insert:', samplesWithPnL.map((t: any) => ({
          symbol: t.symbol,
          trade_type: t.trade_type,
          pnl: t.pnl,
          charges: t.charges,
        })))
        
        console.log('Sample trade to insert:', {
          symbol: trades[0]?.symbol,
          trade_type: trades[0]?.trade_type,
          pnl: trades[0]?.pnl,
          charges: trades[0]?.charges,
          entry_price: trades[0]?.entry_price,
          exit_price: trades[0]?.exit_price,
        })
        console.log('========== CSV IMPORT COMPLETED ==========')
      } catch (parseError: any) {
        console.error('[CSV Import] CSV parsing error:', parseError)
        console.error('[CSV Import] Parse error details:', {
          message: parseError?.message,
          stack: parseError?.stack,
          name: parseError?.name,
          errorString: String(parseError),
          errorJSON: parseError ? JSON.stringify(parseError, Object.getOwnPropertyNames(parseError)) : 'null'
        })
        return NextResponse.json({ 
          error: 'Failed to parse CSV: ' + (parseError?.message || String(parseError) || 'Unknown error')
        }, { status: 400 })
      }
      } catch (csvImportError: any) {
        // Catch any errors in the entire CSV import section (including module resolution)
        console.error('[CSV Import] Fatal error in CSV import:', csvImportError)
        console.error('[CSV Import] Full error details:', {
          message: csvImportError?.message,
          stack: csvImportError?.stack,
          name: csvImportError?.name,
          errorString: String(csvImportError),
          errorJSON: csvImportError ? JSON.stringify(csvImportError, Object.getOwnPropertyNames(csvImportError)) : 'null',
          errorType: typeof csvImportError,
          errorKeys: csvImportError ? Object.keys(csvImportError) : []
        })
        return NextResponse.json({ 
          error: 'CSV import failed: ' + (csvImportError?.message || String(csvImportError) || 'Unknown error'),
          details: process.env.NODE_ENV === 'development' ? {
            message: csvImportError?.message,
            stack: csvImportError?.stack,
            name: csvImportError?.name
          } : undefined
        }, { status: 500 })
      }
    } else {
      // Handle JSON import (existing functionality)
      let requestBody
      try {
        requestBody = await request.json()
      } catch (parseError) {
        console.error('Failed to parse request body:', parseError)
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      }

      trades = requestBody.trades || []
      profileId = requestBody.profile_id || null

      // Validate trades array
      if (!trades || !Array.isArray(trades) || trades.length === 0) {
        return NextResponse.json({ error: 'Trades array is required and must not be empty' }, { status: 400 })
      }

      console.log(`[Import] Received ${trades.length} trades for import (JSON)`)
    }

    // Get current profile ID if not provided
    if (!profileId) {
      try {
        const { getCurrentProfileId } = await import('@/lib/profile-utils')
        profileId = await getCurrentProfileId(user.id)
      } catch (profileError) {
        console.error('Error getting profile ID:', profileError)
        // Continue with null profileId - will use default
      }
    }

    // Get user's automation preferences (with error handling)
    let preferences = {
      auto_tag_enabled: true,
      auto_categorize_enabled: true,
      auto_pattern_detection: true
    }
    
    try {
      const { data: automationPrefs } = await supabase
        .from('automation_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (automationPrefs) {
        preferences = {
          auto_tag_enabled: automationPrefs.auto_tag_enabled ?? true,
          auto_categorize_enabled: automationPrefs.auto_categorize_enabled ?? true,
          auto_pattern_detection: automationPrefs.auto_pattern_detection ?? true
        }
      }
    } catch (prefError) {
      console.warn('Could not fetch automation preferences, using defaults:', prefError)
      // Continue with default preferences
    }

    // Get recent trades for context (exclude soft-deleted) - optional, don't fail if this errors
    let recentTrades: any[] = []
    try {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('trade_date', { ascending: false })
        .limit(20)
      
      recentTrades = data || []
    } catch (recentTradesError) {
      console.warn('Could not fetch recent trades for context:', recentTradesError)
      // Continue without recent trades context
    }

    // For CSV imports, P&L is already calculated - skip recalculation
    // For JSON imports, ALWAYS calculate P&L (removed size limit - P&L is critical)
    // Note: For very large JSON imports (>1000 trades), P&L calculation might be slower
    // but it's essential, so we always do it
    const shouldCalculatePnL = !isCSVImport // Always calculate for JSON imports
    
    let tradesWithCalculatedPnL = trades
    
    // CSV imports already have P&L calculated - skip the JSON import P&L logic
    if (isCSVImport) {
      console.log('[CSV Import] P&L already calculated, skipping recalculation')
      console.log('[CSV Import] Sample trade with P&L:', trades.find((t: any) => t.pnl !== null && t.pnl !== undefined))
      tradesWithCalculatedPnL = trades // Use trades as-is (already have P&L)
    } else if (shouldCalculatePnL) {
      // Calculate P&L for smaller imports
      // Convert trades to TradeData format for P&L calculation
      const tradeDataForPnL: TradeData[] = trades.map((trade: any) => {
        // Normalize transaction_type to BUY or SELL
        let tradeType = (trade.transaction_type || trade.side || '').toUpperCase().trim()
        
        // Handle common variations
        if (tradeType.includes('BUY') || tradeType === 'B' || tradeType === '1') {
          tradeType = 'BUY'
        } else if (tradeType.includes('SELL') || tradeType === 'S' || tradeType === '-1' || tradeType === '2') {
          tradeType = 'SELL'
        }
        
        // Use average_price, entry_price, or exit_price based on trade type
        let price = 0
        if (tradeType === 'BUY') {
          price = trade.entry_price || trade.average_price || 0
        } else if (tradeType === 'SELL') {
          price = trade.exit_price || trade.average_price || 0
        } else {
          price = trade.average_price || trade.entry_price || trade.exit_price || 0
        }
        
        return {
          symbol: (trade.tradingsymbol || '').trim(),
          quantity: Math.abs(trade.quantity || 0), // Ensure positive
          price: price,
          trade_type: (tradeType || 'BUY') as 'BUY' | 'SELL', // Default to BUY if unclear
          instrument_type: (trade.instrument_type || 'EQUITY') as 'EQUITY' | 'FO' | 'OPTIONS',
          lot_size: trade.lot_size,
          charges: trade.charges,
          trade_date: trade.trade_date || '',
          trade_id: trade.trade_id ? String(trade.trade_id).trim() : undefined,
          product: trade.product || 'MIS'
        }
      })
      
      // Debug: Log sample trade data
      if (tradeDataForPnL.length > 0) {
        console.log('[P&L Input] Sample trade data:', {
          symbol: tradeDataForPnL[0].symbol,
          type: tradeDataForPnL[0].trade_type,
          quantity: tradeDataForPnL[0].quantity,
          price: tradeDataForPnL[0].price,
          date: tradeDataForPnL[0].trade_date,
          trade_id: tradeDataForPnL[0].trade_id
        })
      }

      // Process trades with P&L calculation
      const tradesWithPnL = processTradesWithPnL(tradeDataForPnL)

      // Debug logging (only for small batches to avoid log spam)
      if (trades.length <= 50) {
        console.log(`[P&L Calculation] Processing ${trades.length} trades`)
        console.log(`[P&L Calculation] Calculated P&L for ${tradesWithPnL.filter(t => t.pnl !== 0).length} trades`)
      }

      // Create a map of calculated P&L by trade identifier
      // Use multiple keys to ensure we can match trades
      const pnlMap = new Map<string, { pnl: number; pnl_percentage: number; charges: number }>()
      
      tradesWithPnL.forEach(t => {
        // Key 1: By trade_id (most reliable)
        if (t.trade_id) {
          pnlMap.set(`id:${t.trade_id}`, {
            pnl: t.pnl,
            pnl_percentage: t.pnl_percentage,
            charges: t.charges
          })
        }
        
        // Key 2: By date+symbol+quantity+type (fallback)
        const fallbackKey = `fallback:${t.trade_date}_${t.symbol}_${t.quantity}_${t.trade_type}`
        pnlMap.set(fallbackKey, {
          pnl: t.pnl,
          pnl_percentage: t.pnl_percentage,
          charges: t.charges
        })
        
        // Key 3: By symbol+quantity+type+date (alternative fallback)
        const altKey = `alt:${t.symbol}_${t.quantity}_${t.trade_type}_${t.trade_date}`
        if (!pnlMap.has(altKey)) {
          pnlMap.set(altKey, {
            pnl: t.pnl,
            pnl_percentage: t.pnl_percentage,
            charges: t.charges
          })
        }
      })

      // Merge calculated P&L into original trades
      tradesWithCalculatedPnL = trades.map((trade: any, index: number) => {
        // Try multiple keys to find matching P&L
        let calculatedPnL = null
        
        // Try trade_id first
        if (trade.trade_id) {
          calculatedPnL = pnlMap.get(`id:${trade.trade_id}`)
        }
        
        // Try fallback key
        if (!calculatedPnL) {
          const fallbackKey = `fallback:${trade.trade_date}_${trade.tradingsymbol}_${trade.quantity}_${(trade.transaction_type || '').toUpperCase()}`
          calculatedPnL = pnlMap.get(fallbackKey)
        }
        
        // Try alternative key
        if (!calculatedPnL) {
          const altKey = `alt:${trade.tradingsymbol}_${trade.quantity}_${(trade.transaction_type || '').toUpperCase()}_${trade.trade_date}`
          calculatedPnL = pnlMap.get(altKey)
        }
        
        // Debug first few trades (only for small batches)
        if (trades.length <= 50 && index < 3) {
          console.log(`[P&L Mapping] Trade ${index}:`, {
            symbol: trade.tradingsymbol,
            type: trade.transaction_type,
            quantity: trade.quantity,
            date: trade.trade_date,
            trade_id: trade.trade_id,
            foundPnL: calculatedPnL ? calculatedPnL.pnl : 'NOT FOUND',
            existingPnL: trade.pnl,
            hasEntryExit: !!(trade.entry_price && trade.exit_price)
          })
        }
        
        // Only use calculated P&L if CSV doesn't already have P&L or if it's 0
        if (calculatedPnL && (!trade.pnl || trade.pnl === 0)) {
          const result = {
            ...trade,
            pnl: calculatedPnL.pnl,
            pnl_percentage: calculatedPnL.pnl_percentage,
            charges: calculatedPnL.charges
          }
          
          // Debug (only for small batches)
          if (trades.length <= 50 && index < 3) {
            console.log(`[P&L Mapping] Assigned P&L:`, result.pnl)
          }
          
          return result
        }
        
        // Fallback: If we have entry_price and exit_price, calculate directly
        if ((!calculatedPnL || calculatedPnL.pnl === 0) && trade.entry_price && trade.exit_price) {
          const directCalc = calculateSingleTradePnL({
            entry_price: trade.entry_price,
            exit_price: trade.exit_price,
            quantity: trade.quantity,
            instrument_type: trade.instrument_type || 'EQUITY',
            lot_size: trade.lot_size,
            product: trade.product || 'MIS'
          })
          
          if (directCalc.pnl !== 0) {
            if (trades.length <= 50) {
              console.log(`[P&L Direct] Calculated P&L from entry/exit prices:`, directCalc.pnl)
            }
            return {
              ...trade,
              pnl: directCalc.pnl,
              pnl_percentage: directCalc.pnl_percentage,
              charges: directCalc.charges
            }
          }
        }
        
        // If CSV has P&L, use it but still calculate charges if missing
        return {
          ...trade,
          charges: trade.charges || calculatedPnL?.charges || 0,
          pnl_percentage: trade.pnl_percentage || calculatedPnL?.pnl_percentage || 0,
          // Ensure pnl is set (use existing or 0)
          pnl: trade.pnl || 0
        }
      })
      
      // Debug: Count how many trades got P&L assigned (only for small batches)
      if (trades.length <= 50) {
        const tradesWithPnLCount = tradesWithCalculatedPnL.filter(t => t.pnl && t.pnl !== 0).length
        console.log(`[P&L Calculation] Final: ${tradesWithPnLCount} trades have P&L assigned`)
      }
    } else {
      // This should never happen now since shouldCalculatePnL is always true for JSON imports
      // But keep as fallback - ensure charges field exists
      console.warn('[Import] P&L calculation was skipped - this should not happen for JSON imports')
      tradesWithCalculatedPnL = trades.map((trade: any) => ({
        ...trade,
        charges: trade.charges || 0,
        // If P&L wasn't calculated, it will be null/0 - user will need to recalculate
        pnl: trade.pnl || null
      }))
    }

    // Optimize batch size based on import size
    // Larger batches for large imports to reduce database round trips
    const batchSize = tradesWithCalculatedPnL.length > 500 ? 200 : 100
    let totalInserted = 0
    const violations: Array<{ trade: any; violations: any[] }> = []
    const blockedTrades: any[] = []

    console.log(`[Import] Processing ${tradesWithCalculatedPnL.length} trades in batches of ${batchSize}`)

    for (let i = 0; i < tradesWithCalculatedPnL.length; i += batchSize) {
      const batch = tradesWithCalculatedPnL.slice(i, i + batchSize)
      
      // Log progress for large imports
      if (tradesWithCalculatedPnL.length > 500 && i % (batchSize * 5) === 0) {
        const progress = Math.round((i / tradesWithCalculatedPnL.length) * 100)
        console.log(`[Import Progress] ${progress}% complete (${i}/${tradesWithCalculatedPnL.length} trades)`)
      }

      // Apply automation to each trade if enabled
      const automatedBatch = batch.map((trade: any) => {
        if (preferences.auto_tag_enabled || preferences.auto_categorize_enabled || preferences.auto_pattern_detection) {
          const automation = applyAutomation(
            trade,
            recentTrades || [],
            {
              autoTagEnabled: preferences.auto_tag_enabled || false,
              autoCategorizeEnabled: preferences.auto_categorize_enabled || false,
              autoDetectSetupEnabled: preferences.auto_pattern_detection || false
            }
          )

          return {
            ...trade,
            journal_tags: automation.tags || trade.journal_tags || [],
            strategy: automation.strategy || trade.strategy,
            setup: automation.setup || trade.setup
          }
        }
        return trade
      })

      // Validate trades against rules (batch validation for performance)
      // For large imports, skip individual rule validation to speed up import
      // Rules will still be checked on future trades, but we don't block historical imports
      const tradesToInsert: any[] = []
      // Skip rule validation for large imports to speed up processing
      const shouldValidateRules = tradesWithCalculatedPnL.length <= 300 && automatedBatch.length < 200
      
      if (shouldValidateRules) {
        for (const trade of automatedBatch) {
          try {
            const validation = await validateTradeAgainstRules(user.id, trade)
            
            if (!validation.allowed) {
              // Trade blocked by rules
              blockedTrades.push(trade)
              violations.push({ trade, violations: validation.violations })
              
              // Log violations
              for (const violation of validation.violations) {
                await logRuleViolation(
                  user.id,
                  violation.rule.id,
                  null, // trade_id not yet created
                  violation.details
                )
              }
              continue // Skip this trade
            } else if (validation.violations.length > 0) {
              // Trade allowed but has warnings
              violations.push({ trade, violations: validation.violations })
              
              // Log warnings (non-blocking violations)
              for (const violation of validation.violations) {
                if (violation.rule.severity === 'warning') {
                  await logRuleViolation(
                    user.id,
                    violation.rule.id,
                    null,
                    violation.details
                  )
                }
              }
            }
            
            tradesToInsert.push(trade)
          } catch (ruleError) {
            // If rule validation fails, log but don't block import
            console.error('Rule validation error for trade:', ruleError)
            tradesToInsert.push(trade)
          }
        }
      } else {
        // For large imports, skip rule validation to speed up import
        // All trades will be inserted, rules apply to future trades only
        tradesToInsert.push(...automatedBatch)
      }

      // Only insert trades that passed validation
      if (tradesToInsert.length > 0) {
        // Ensure deleted_at is null and profile_id is set for new trades
        // CRITICAL: Explicitly include pnl, pnl_percentage, and charges fields
        const tradesToUpsert = tradesToInsert.map(trade => {
          const tradeData: any = {
            ...trade,
            deleted_at: null,
            profile_id: trade.profile_id || profileId, // Use trade's profile_id if provided, otherwise use current profile
            user_id: user.id, // Ensure user_id is set
          }
          
          // CRITICAL: Explicitly set P&L fields to ensure they're saved
          // For CSV imports, pnl is already calculated and should be preserved
          if (trade.pnl !== undefined && trade.pnl !== null) {
            tradeData.pnl = parseFloat(trade.pnl.toFixed(2))
          } else {
            tradeData.pnl = null // Open positions have null P&L
          }
          
          if (trade.pnl_percentage !== undefined && trade.pnl_percentage !== null) {
            tradeData.pnl_percentage = parseFloat(trade.pnl_percentage.toFixed(2))
          }
          
          if (trade.charges !== undefined && trade.charges !== null) {
            tradeData.charges = parseFloat(trade.charges.toFixed(2))
          } else {
            tradeData.charges = 0
          }
          
          // Ensure entry_price and exit_price are set if available
          if (trade.entry_price !== undefined && trade.entry_price !== null) {
            tradeData.entry_price = parseFloat(trade.entry_price.toFixed(2))
          }
          if (trade.exit_price !== undefined && trade.exit_price !== null) {
            tradeData.exit_price = parseFloat(trade.exit_price.toFixed(2))
          }
          
          return tradeData
        })
        
        // Debug: Log first trade to verify P&L is included (only for first batch)
        if (i === 0 && tradesToUpsert.length > 0) {
          console.log('[DB Insert] Sample trade being inserted:', {
            symbol: tradesToUpsert[0].symbol || tradesToUpsert[0].tradingsymbol,
            trade_type: tradesToUpsert[0].trade_type || tradesToUpsert[0].transaction_type,
            pnl: tradesToUpsert[0].pnl,
            pnl_percentage: tradesToUpsert[0].pnl_percentage,
            charges: tradesToUpsert[0].charges,
            entry_price: tradesToUpsert[0].entry_price,
            exit_price: tradesToUpsert[0].exit_price,
            hasPnL: tradesToUpsert[0].pnl !== undefined && tradesToUpsert[0].pnl !== null,
            isCSVImport: isCSVImport
          })
        }
        
        // For CSV imports, use insert to ensure P&L is saved
        // For JSON imports, use upsert to handle duplicates
        let insertedTrades: any[] | null = null
        let error: any = null
        let count: number | null = null
        
        if (isCSVImport) {
          // CSV imports - use insert to ensure all fields including P&L are saved
          const result = await supabase
            .from('trades')
            .insert(tradesToUpsert)
            .select()
          
          insertedTrades = result.data
          error = result.error
          count = insertedTrades?.length || 0
        } else {
          // JSON imports - use upsert to handle duplicates
          const result = await supabase
            .from('trades')
            .upsert(tradesToUpsert, {
              onConflict: 'user_id,trade_id',
              ignoreDuplicates: true,
              count: 'exact',
            })
            .select()
          
          insertedTrades = result.data
          error = result.error
          count = result.count
        }

        if (error) {
          console.error('[DB Insert Error]', error)
          console.error('[DB Insert Error] Sample trade that failed:', tradesToUpsert[0])
          throw error
        }
        
        // Debug: Verify P&L was saved (only for first batch)
        if (i === 0 && insertedTrades && insertedTrades.length > 0) {
          console.log('[DB Insert Success] Sample inserted trade:', {
            id: insertedTrades[0].id,
            symbol: insertedTrades[0].symbol || insertedTrades[0].tradingsymbol,
            pnl: insertedTrades[0].pnl,
            charges: insertedTrades[0].charges,
            entry_price: insertedTrades[0].entry_price,
            exit_price: insertedTrades[0].exit_price,
          })
        }

        // Log violations with actual trade IDs
        if (insertedTrades && violations.length > 0) {
          for (let j = 0; j < insertedTrades.length; j++) {
            const trade = insertedTrades[j]
            const violationEntry = violations.find(v => 
              v.trade.tradingsymbol === trade.tradingsymbol &&
              v.trade.trade_date === trade.trade_date
            )
            if (violationEntry) {
              for (const violation of violationEntry.violations) {
                await logRuleViolation(
                  user.id,
                  violation.rule.id,
                  trade.id,
                  violation.details
                )
              }
            }
          }
        }

        // count = rows actually inserted/updated in this batch
        totalInserted += count ?? 0
      }
    }

    // Update adherence stats once at the end (not per batch)
    if (totalInserted > 0) {
      try {
        const { updateAdherenceStats } = await import('@/lib/rule-engine')
        await updateAdherenceStats(user.id, true)
      } catch (statsError) {
        // Don't fail import if stats update fails
        console.error('Error updating adherence stats:', statsError)
      }
    }

    // Trigger pattern detection in background (async, don't wait)
    if (preferences.auto_pattern_detection && totalInserted > 0) {
      // Fire and forget - don't block the response
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron/generate-insights`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`
        }
      }).catch(err => console.error('Background pattern detection failed:', err))
    }

    // log this import
    await supabase.from('import_logs').insert({
      user_id: user.id,
      source: 'zerodha_tradebook',
      rows_imported: totalInserted,
    })

    // Calculate summary for CSV imports
    let summary: any = null
    if (isCSVImport && trades.length > 0) {
      const realizedTrades = trades.filter((t: any) => t.pnl !== null && t.pnl !== undefined)
      const totalPnL = realizedTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
      const totalCharges = trades.reduce((sum: number, t: any) => sum + (t.charges || 0), 0)
      const netPnL = realizedTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0) - totalCharges
      
      summary = {
        totalTrades: trades.length,
        totalPnL: parseFloat(totalPnL.toFixed(2)),
        netPnL: parseFloat(netPnL.toFixed(2)),
        totalCharges: parseFloat(totalCharges.toFixed(2)),
        realizedTrades: realizedTrades.length,
        openPositions: trades.filter((t: any) => t.pnl === null || t.pnl === undefined).length,
      }
      
      console.log('[CSV Import Summary]', summary)
    }
    
    return NextResponse.json({ 
      success: true, 
      imported: totalInserted,
      count: totalInserted,
      blocked: blockedTrades.length,
      pnlCalculated: isCSVImport || shouldCalculatePnL, // Indicate if P&L was calculated
      violations: violations.length > 0 ? violations.map(v => ({
        symbol: v.trade.tradingsymbol || v.trade.symbol,
        violations: v.violations.map(viol => viol.message)
      })) : [],
      // Include CSV detection info and summary if available
      ...(detectedFormat ? {
        broker: detectedFormat.broker,
        confidence: detectedFormat.confidence,
      } : {}),
      ...(summary ? { summary } : {})
    })
  } catch (error: any) {
    // Capture the FULL error message (not truncated)
    const errorMessage = error?.message || String(error) || 'Unknown error occurred'
    const errorStack = error?.stack || 'No stack trace'
    const errorName = error instanceof Error ? error.name : 'Unknown'
    
    // Log FULL error details (this will show in server console)
    console.error('='.repeat(80))
    console.error('[Import] UNHANDLED ERROR - FULL DETAILS:')
    console.error('='.repeat(80))
    console.error('Error Message:', errorMessage)
    console.error('Error Name:', errorName)
    console.error('Error Type:', typeof error)
    console.error('Error Keys:', error ? Object.keys(error) : [])
    console.error('Error String:', String(error))
    if (errorStack && errorStack !== 'No stack trace') {
      console.error('Stack Trace:')
      console.error(errorStack)
    }
    try {
      const errorJSON = error ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2) : 'null'
      console.error('Error JSON:')
      console.error(errorJSON)
    } catch (jsonError) {
      console.error('Could not stringify error:', jsonError)
    }
    console.error('='.repeat(80))
    
    // Return FULL error message (not truncated) - always include message in response
    return NextResponse.json({ 
      error: 'Import failed',
      message: errorMessage, // This is the FULL message, not truncated
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      name: errorName,
      details: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        stack: errorStack,
        name: errorName,
        errorType: typeof error,
        errorKeys: error ? Object.keys(error) : []
      } : undefined
    }, { status: 500 })
  }
}

