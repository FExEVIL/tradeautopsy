# 🔧 Step-by-Step: Fix 404 Errors

## Current Problem
404 errors for `predictive_alerts` and `ai_insights` tables = **Tables don't exist in database**

## ✅ Solution: Run Migration in Supabase

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Combined Migration

1. **Open this file** in your code editor:
   - `supabase/migrations/COMBINED_ALL_TABLES.sql`

2. **Select ALL** (Cmd+A / Ctrl+A)

3. **Copy** (Cmd+C / Ctrl+C)

4. **Paste** into Supabase SQL Editor

5. **Click "Run"** button (or press Cmd+Enter / Ctrl+Enter)

6. **Wait for success message** - Should say "Success. No rows returned"

### Step 3: Verify Tables Were Created

**In Supabase SQL Editor**, run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_insights', 'predictive_alerts', 'detected_patterns', 'action_plans', 'goals', 'alert_preferences')
ORDER BY table_name;
```

**Expected Result**: Should show 6 rows:
- action_plans
- ai_insights
- alert_preferences
- detected_patterns
- goals
- predictive_alerts

### Step 4: Refresh Your App

1. **Hard refresh** browser:
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

2. **Check console** - 404 errors should be gone ✅

## 🐛 If Migration Fails

### Error: "relation already exists"
- **Safe to ignore** - Tables already exist
- Just refresh your app

### Error: "permission denied"
- Check you're using the correct Supabase project
- Verify you have admin access

### Error: "syntax error"
- Make sure you copied the ENTIRE file
- Check for any partial copy

## 🧪 Test After Migration

Once tables exist, test in browser console:

```javascript
// Test fetching alerts
fetch('/api/alerts?dismissed=false&limit=5')
  .then(r => r.json())
  .then(data => console.log('Alerts:', data))
  .catch(err => console.error('Error:', err))
```

Should return: `{ alerts: [] }` (empty array is OK, means table exists!)

## 📋 Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied entire `COMBINED_ALL_TABLES.sql` file
- [ ] Pasted and ran in SQL Editor
- [ ] Got success message
- [ ] Verified 6 tables exist (using verification query)
- [ ] Hard refreshed browser
- [ ] 404 errors gone ✅

---

**If you still see 404 after running migration, let me know and I'll help debug!**

