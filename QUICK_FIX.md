# ⚡ QUICK FIX: Console Errors

## The Problem
Console shows:
```
PGRST205: Could not find the table 'public.ai_insights'
PGRST205: Could not find the table 'public.predictive_alerts'
```

## ✅ Solution: Run Migration (2 minutes)

### 1️⃣ Open Supabase
- Go to: https://supabase.com/dashboard
- Select your project
- Click **"SQL Editor"** (left sidebar)

### 2️⃣ Copy Migration SQL
- Open file: `COPY_PASTE_MIGRATION.sql`
- **Select ALL** (Cmd+A)
- **Copy** (Cmd+C)

### 3️⃣ Paste & Run
- **Paste** into Supabase SQL Editor
- Click **"Run"** button
- Wait for "Success" ✅

### 4️⃣ Verify (Optional)
Run this in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_insights', 'predictive_alerts', 'detected_patterns', 'action_plans', 'goals', 'alert_preferences');
```
Should return **6 rows**.

### 5️⃣ Refresh Browser
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Console errors will be **GONE** ✅

---

**That's it! The migration creates all 6 tables at once.**

