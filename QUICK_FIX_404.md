# 🚨 Quick Fix: 404 Errors

## Problem
You're seeing 404 errors for `ai_insights` and `predictive_alerts` tables.

## ✅ Solution (2 minutes)

### Option 1: Combined Migration (Easiest)

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Copy entire file**: `supabase/migrations/COMBINED_ALL_TABLES.sql`
3. **Paste** into SQL Editor
4. **Click Run**
5. **Refresh browser** (Cmd+Shift+R)

**Done!** All tables created at once.

### Option 2: Run Migrations Separately

**Migration 1:**
- Copy: `supabase/migrations/20251203000000_add_ai_coach_tables.sql`
- Paste & Run in Supabase SQL Editor

**Migration 2:**
- Copy: `supabase/migrations/20251204000000_add_predictive_alerts.sql`
- Paste & Run in Supabase SQL Editor

### Verify Success

Run this in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_insights', 'predictive_alerts')
ORDER BY table_name;
```

Should return 2 rows.

### After Migration

1. **Hard refresh** browser (Cmd+Shift+R / Ctrl+Shift+R)
2. **404 errors disappear** ✅
3. Components load (may show empty states)

---

**That's it!** Run the migration and refresh. 🎉

