# Fix 404 Errors - Missing Database Tables

## 🔴 Problem

You're seeing 404 errors for:
- `ai_insights` table
- `predictive_alerts` table

This means these tables don't exist in your Supabase database yet.

## ✅ Solution: Run Database Migrations

### Step 1: Run AI Coach Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20251203000000_add_ai_coach_tables.sql`
4. **Copy the entire SQL content**
5. **Paste** into SQL Editor
6. Click **Run**

This creates:
- `ai_insights` table
- `detected_patterns` table
- `action_plans` table
- `goals` table

### Step 2: Run Predictive Alerts Migration

1. Still in **SQL Editor**
2. Open the file: `supabase/migrations/20251204000000_add_predictive_alerts.sql`
3. **Copy the entire SQL content**
4. **Paste** into SQL Editor
5. Click **Run**

This creates:
- `predictive_alerts` table
- `alert_preferences` table

### Step 3: Verify Tables Exist

Run this in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_insights', 'predictive_alerts', 'detected_patterns', 'action_plans', 'goals', 'alert_preferences')
ORDER BY table_name;
```

**Expected Result**: Should return 6 rows (one for each table)

### Step 4: Refresh Your App

After running migrations:
1. **Refresh** your browser (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
2. The 404 errors should disappear
3. Components will load (may show empty states if no data yet)

## 🚀 Quick Copy-Paste Commands

### Migration 1: AI Coach Tables

Copy from: `supabase/migrations/20251203000000_add_ai_coach_tables.sql`

### Migration 2: Predictive Alerts

Copy from: `supabase/migrations/20251204000000_add_predictive_alerts.sql`

## ⚠️ If Tables Already Exist

If you get errors like "relation already exists":
- The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run again
- If you get policy errors, you may need to drop and recreate policies

## ✅ After Migration

Once tables exist:
- ✅ `AICoachCard` will load (may show "No new insights")
- ✅ `PredictiveAlerts` will load (may show empty)
- ✅ No more 404 errors in console

## 🧪 Test After Migration

1. **Generate some alerts** (if you have trades):
   ```javascript
   // In browser console
   fetch('/api/alerts/generate', { method: 'POST' })
     .then(r => r.json())
     .then(console.log)
   ```

2. **Check dashboard** - components should load without errors

---

**Run both migrations and refresh your app!** The 404 errors will disappear once tables exist.

