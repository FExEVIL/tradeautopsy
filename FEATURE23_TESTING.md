# Feature 23: Predictive Alerts - Migration & Testing Guide

## Step 1: Run Database Migration

### Option A: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/migrations/20251204000000_add_predictive_alerts.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute

### Option B: Supabase CLI (if installed)

```bash
cd /Users/bishnu/Tradeautopsy1/Untitled/tradeautopsy
supabase db push
```

### Verify Migration Success

Run this in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('predictive_alerts', 'alert_preferences');

-- Should return 2 rows
```

## Step 2: Test the Implementation

### 2.1 Start Development Server

```bash
cd /Users/bishnu/Tradeautopsy1/Untitled/tradeautopsy
npm run dev
```

### 2.2 Test API Endpoints

#### Test Alert Generation (Manual Trigger)

```bash
# Make sure you're logged in, then:
curl -X POST http://localhost:3000/api/alerts/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Or use browser console:
fetch('/api/alerts/generate', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

#### Test Fetching Alerts

```bash
curl http://localhost:3000/api/alerts?dismissed=false&limit=10
```

### 2.3 Test UI Components

1. **Dashboard Alerts**
   - Navigate to `http://localhost:3000/dashboard`
   - Alerts should appear at the top (if conditions are met)
   - Try dismissing an alert

2. **Alert Preferences**
   - Navigate to `http://localhost:3000/dashboard/settings/alerts`
   - Toggle alert types on/off
   - Set notification frequency
   - Configure quiet hours
   - Save preferences

### 2.4 Test Alert Generation Logic

To trigger alerts, you need trades that match these conditions:

**Tilt Warning:**
- 2+ consecutive losses
- Increased position size (>1.5x average)

**Avoid Trading:**
- 5+ trades at current hour
- Average P&L < -₹500 at that hour

**Best Time:**
- Most profitable hour identified
- Average P&L > ₹1000
- 5+ trades at that hour

**Take a Break:**
- 5+ trades today
- Net loss today OR 10+ trades (even if profitable)

## Step 3: Manual Testing Checklist

- [ ] Migration ran successfully (tables created)
- [ ] Can access `/dashboard` - alerts component loads
- [ ] Can access `/dashboard/settings/alerts` - preferences page loads
- [ ] Can toggle alert preferences
- [ ] Can save preferences
- [ ] Alert generation API works (POST `/api/alerts/generate`)
- [ ] Alerts fetch API works (GET `/api/alerts`)
- [ ] Alerts appear on dashboard when conditions met
- [ ] Can dismiss alerts
- [ ] Can mark alerts as "heeded"
- [ ] Real-time updates work (new alerts appear without refresh)

## Step 4: Test with Sample Data

If you don't have enough trades, you can test by:

1. Import some trades via CSV
2. Or manually create trades that match alert conditions
3. Then trigger alert generation

## Troubleshooting

### Alerts Not Showing

1. Check if you have at least 5 trades
2. Check alert preferences (may be disabled)
3. Check if alerts were generated:
   ```sql
   SELECT * FROM predictive_alerts 
   WHERE user_id = 'your-user-id' 
   AND dismissed = false;
   ```

### Migration Errors

- If tables already exist, the migration uses `CREATE TABLE IF NOT EXISTS` so it's safe
- If RLS policies conflict, you may need to drop and recreate them

### API Errors

- Check browser console for errors
- Verify you're authenticated
- Check Supabase connection

## Expected Behavior

✅ **Alerts appear automatically** when:
- Background cron job runs (if configured)
- User manually triggers via API
- Conditions are met based on recent trades

✅ **Alerts respect preferences:**
- Only enabled alert types are generated
- Quiet hours are respected (if configured)

✅ **Real-time updates:**
- New alerts appear without page refresh
- Dismissed alerts disappear immediately

---

**Ready to test!** Run the migration first, then test the endpoints and UI.

