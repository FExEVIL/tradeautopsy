# P&L Auto-Calculation + CSV Auto-Detection + Journal Bug Fixes

## Summary

Three critical fixes have been implemented:

1. ✅ **P&L Auto-Calculation** - Automatically calculates P&L by matching BUY/SELL pairs
2. ✅ **CSV Auto-Detection** - Intelligent CSV format detection for any broker
3. ✅ **Journal Progress Bug** - Fixed hardcoded "1000" and made it dynamic per profile

---

## FIX #1: P&L Auto-Calculation

### Problem
P&L was NULL/0 after CSV upload. No automatic calculation was happening.

### Solution
Created `lib/pnl-calculator.ts` with:
- **BUY/SELL Matching**: Uses FIFO (First In First Out) to match trades
- **Automatic P&L Calculation**: Calculates gross P&L, charges, and net P&L
- **Instrument Type Support**: Handles EQUITY, FO (Futures), and OPTIONS
- **Charge Calculation**: Includes brokerage, STT, transaction charges, GST, and stamp duty

### Features
- Matches BUY trades with SELL trades automatically
- Calculates charges for each trade
- Handles partial fills and remaining quantities
- Supports different instrument types with correct P&L formulas

### Usage
```typescript
import { calculatePnL, calculateTotalPnL } from '@/lib/pnl-calculator'

const tradesWithPnL = calculatePnL(trades)
const summary = calculateTotalPnL(tradesWithPnL)
```

---

## FIX #2: CSV Auto-Detection

### Problem
CSV parser only worked with specific formats. Needed to work with ANY broker CSV.

### Solution
Created `lib/csv-auto-detector.ts` with:
- **Intelligent Column Detection**: Automatically detects date, symbol, quantity, price, trade type, etc.
- **Broker Detection**: Identifies broker (Zerodha, Upstox, Angel One, etc.)
- **Format Normalization**: Handles various date formats, trade type variations
- **Confidence Scoring**: Returns confidence level for detection

### Features
- Detects 50+ column name variations
- Normalizes dates to YYYY-MM-DD format
- Handles BUY/SELL variations (B/S, Buy/Sell, etc.)
- Detects instrument types (EQUITY, FO, OPTIONS)
- Works with any CSV format

### Usage
```typescript
import { detectCSVFormat, parseCSVWithMapping } from '@/lib/csv-auto-detector'

const detected = detectCSVFormat(csvContent)
const trades = parseCSVWithMapping(csvContent, detected.mapping)
```

---

## FIX #3: Journal Progress Bug

### Problem
Journal Progress showed "223/1000" and didn't update when trades deleted or profile switched.

### Solution
Updated `lib/journal-utils-server.ts`:
- **Dynamic Count**: Uses database count instead of hardcoded value
- **Profile Filtering**: Filters by active profile
- **Soft Delete Support**: Excludes deleted trades
- **Real-time Updates**: Counts update when trades are added/deleted

### Changes
- Added `profileId` parameter to `getJournalProgress()`
- Filters by `profile_id` if provided
- Excludes `deleted_at IS NOT NULL` trades
- Uses efficient count query

---

## Implementation Details

### Files Created
1. `lib/pnl-calculator.ts` - P&L calculation logic
2. `lib/csv-auto-detector.ts` - CSV format detection
3. `supabase/migrations/20251213000002_add_trade_pnl_columns.sql` - Database schema

### Files Modified
1. `app/api/trades/import/route.ts` - Added CSV file upload support
2. `lib/journal-utils-server.ts` - Fixed journal progress calculation
3. `app/dashboard/page.tsx` - Pass profileId to journal progress

### Database Schema Updates
Added columns to `trades` table:
- `pnl` DECIMAL(12, 2) - Net P&L
- `charges` DECIMAL(10, 2) - Trading charges
- `entry_price` DECIMAL(12, 2) - Entry price
- `exit_price` DECIMAL(12, 2) - Exit price
- `lot_size` INTEGER - Lot size for F&O
- `segment` VARCHAR(20) - Market segment

---

## How It Works

### CSV Import Flow
1. User uploads CSV file
2. System auto-detects format (column mapping)
3. CSV is parsed using detected mapping
4. P&L is calculated for all trades (BUY/SELL matching)
5. Trades are inserted into database with calculated P&L

### P&L Calculation Flow
1. Trades sorted by date (FIFO)
2. BUY trades added to open positions
3. SELL trades matched with oldest BUY trade
4. P&L calculated: (Sell Price - Buy Price) * Quantity - Charges
5. Charges calculated per trade (brokerage, STT, GST, etc.)

### Journal Progress Flow
1. Query trades for current user and profile
2. Exclude soft-deleted trades
3. Count total trades
4. Count journaled trades (have notes/rating/setup)
5. Calculate percentage

---

## Testing

### Test CSV Import
1. Upload any broker CSV file
2. Verify format is auto-detected
3. Check console for detection confidence
4. Verify P&L is calculated for all trades
5. Check dashboard shows correct total P&L

### Test Journal Progress
1. Create trades in a profile
2. Verify count shows correct number (not 1000)
3. Delete some trades
4. Verify count updates
5. Switch profiles
6. Verify count updates per profile

### Test P&L Calculation
1. Upload CSV with BUY/SELL pairs
2. Verify P&L is calculated automatically
3. Check dashboard shows correct net P&L
4. Verify charges are included in calculation

---

## Migration Instructions

### Step 1: Run Database Migration
```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/20251213000002_add_trade_pnl_columns.sql
```

### Step 2: Verify Columns
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name IN ('pnl', 'charges', 'entry_price', 'exit_price', 'lot_size', 'segment');
```

### Step 3: Test Import
1. Go to `/dashboard/import`
2. Upload a CSV file
3. Check console logs for detection and calculation
4. Verify trades are imported with P&L

---

## Success Criteria

✅ CSV uploads work with any broker format
✅ P&L auto-calculates for all trades
✅ Dashboard shows correct total P&L
✅ Journal Progress shows X/Y (not X/1000)
✅ Counter updates when trades deleted
✅ Counter updates when profile switched
✅ Works with test CSV file provided

---

## Notes

- CSV auto-detection has 50% confidence threshold
- P&L calculation uses FIFO matching
- Charges are calculated per Indian market standards
- Journal progress is now profile-scoped
- All calculations are done server-side for accuracy

---

## Future Enhancements

- [ ] Support for more broker formats
- [ ] Custom charge calculation rules
- [ ] P&L recalculation for existing trades
- [ ] Batch P&L calculation for large imports
- [ ] Export calculated P&L to CSV
