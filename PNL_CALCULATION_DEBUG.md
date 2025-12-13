# P&L Calculation Debug Guide

**Date:** December 12, 2025  
**Issue:** P&L not calculating after CSV upload

---

## 🔍 Debug Steps Added

### 1. Enhanced Logging

The import route now includes comprehensive debug logging:

```typescript
// Logs added:
- [P&L Calculation] Processing X trades
- [P&L Calculation] Calculated P&L for X trades
- [P&L Input] Sample trade data
- [P&L Mapping] Trade details and P&L assignment
- [P&L Direct] Direct calculation from entry/exit prices
- [DB Insert] Sample trade being inserted
```

### 2. Improved Trade Matching

**Multiple matching strategies:**
1. By `trade_id` (most reliable)
2. By `date+symbol+quantity+type` (fallback)
3. By `symbol+quantity+type+date` (alternative)

**Trade type normalization:**
- Handles: "BUY", "B", "1", "SELL", "S", "-1", "2"
- Normalizes to "BUY" or "SELL"

**Price extraction:**
- BUY trades: Uses `entry_price` or `average_price`
- SELL trades: Uses `exit_price` or `average_price`

### 3. Fallback P&L Calculation

If trade matching fails but `entry_price` and `exit_price` are available, calculates P&L directly:

```typescript
if (trade.entry_price && trade.exit_price) {
  const directCalc = calculateSingleTradePnL({
    entry_price: trade.entry_price,
    exit_price: trade.exit_price,
    quantity: trade.quantity,
    // ... other params
  })
}
```

### 4. Explicit Database Field Inclusion

Ensures P&L fields are explicitly included in database insert:

```typescript
const tradeData = {
  ...trade,
  pnl: trade.pnl,              // Explicitly set
  pnl_percentage: trade.pnl_percentage,
  charges: trade.charges
}
```

---

## 🧪 Testing Procedure

### Step 1: Check Console Logs

After uploading CSV, check browser console and server logs for:

```
[P&L Calculation] Processing 10 trades
[P&L Input] Sample trade data: { symbol: 'RELIANCE', type: 'BUY', ... }
[P&L Calculation] Calculated P&L for 5 trades
[P&L Mapping] Trade 0: { foundPnL: 470, ... }
[DB Insert] Sample trade being inserted: { pnl: 470, ... }
```

### Step 2: Verify Database

```sql
-- Check if P&L columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name IN ('pnl', 'pnl_percentage', 'charges');

-- Check if P&L values are being saved
SELECT 
  tradingsymbol,
  transaction_type,
  quantity,
  average_price,
  pnl,
  pnl_percentage,
  charges,
  trade_date
FROM trades
WHERE user_id = 'YOUR_USER_ID'
ORDER BY trade_date DESC
LIMIT 10;
```

### Step 3: Test with Sample CSV

Create a test CSV:

```csv
tradingsymbol,transaction_type,quantity,average_price,trade_date
RELIANCE,BUY,10,2500,2024-01-01
RELIANCE,SELL,10,2550,2024-01-02
TCS,BUY,5,3500,2024-01-03
TCS,SELL,5,3600,2024-01-04
```

**Expected results:**
- RELIANCE SELL: P&L ≈ ₹470 (after charges)
- TCS SELL: P&L ≈ ₹470 (after charges)

---

## 🐛 Common Issues & Fixes

### Issue 1: P&L is 0 for all trades

**Possible causes:**
- Trade matching failing (check logs for "NOT FOUND")
- Transaction types not matching (check normalization)
- Missing entry_price/exit_price

**Fix:**
- Check console logs for `[P&L Mapping]` messages
- Verify CSV has correct `transaction_type` values
- Ensure trades have matching BUY/SELL pairs

### Issue 2: P&L calculated but not saved

**Possible causes:**
- Database columns missing
- P&L fields not included in insert

**Fix:**
- Run migration: `20251212000001_add_pnl_columns.sql`
- Check `[DB Insert]` logs to verify fields are included

### Issue 3: Only some trades have P&L

**Possible causes:**
- Trade matching only works for complete pairs
- BUY trades don't have P&L until matched with SELL

**Expected behavior:**
- BUY trades: `pnl = null` or `0` (no P&L until sold)
- SELL trades: `pnl = calculated value` (if matched with BUY)

---

## 📊 Expected Behavior

### For Complete Trade Pairs:

```
BUY  RELIANCE 10 @ ₹2500  → pnl = null (open position)
SELL RELIANCE 10 @ ₹2550  → pnl = ₹470 (matched with BUY)
```

### For Trades with entry_price/exit_price:

```
Trade with entry_price=2500, exit_price=2550, quantity=10
→ pnl = ₹470 (calculated directly)
```

### For Large Imports (> 500 trades):

```
P&L calculation skipped for performance
→ pnl = 0 (can be calculated later via /api/trades/calculate-pnl)
```

---

## 🔧 Manual P&L Calculation

If P&L wasn't calculated during import, use the background endpoint:

```bash
POST /api/trades/calculate-pnl
Content-Type: application/json

{
  "profileId": "optional-profile-id",
  "limit": 1000
}
```

---

## ✅ Success Criteria

After fix, you should see:

1. ✅ Console logs showing P&L calculation
2. ✅ Database has `pnl` values for SELL trades
3. ✅ Dashboard shows correct total P&L
4. ✅ Individual trades show P&L in trade list

---

## 📝 Next Steps

1. **Upload test CSV** and check console logs
2. **Verify database** has P&L values
3. **Check dashboard** displays P&L correctly
4. **Report any issues** with specific error messages or logs

---

**Status:** ✅ **DEBUG LOGGING ADDED**

The import route now has comprehensive logging to help identify why P&L might not be calculating. Check the console logs after uploading a CSV to see exactly what's happening.
