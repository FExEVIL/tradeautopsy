# RLS Performance Fix - Instructions

## ⚠️ Error: "policy does not exist"

If you got this error, it's because `ALTER POLICY` **cannot modify USING clauses** in PostgreSQL. You need to use `DROP POLICY` and `CREATE POLICY` instead.

## ✅ Solution: Use These Files

### Option 1: Automated Fix (Recommended)

**File:** `FIX-RLS-PERFORMANCE-AUTO.sql`

This script automatically:
- Finds all policies with `auth.uid()` or `auth.jwt()`
- Generates optimized versions with `(SELECT auth.uid())`
- Drops and recreates them safely

**How to run:**
1. Open Supabase SQL Editor
2. Copy and paste the entire `FIX-RLS-PERFORMANCE-AUTO.sql` file
3. Click "Run"
4. Check the output for any warnings

**Time:** ~5 minutes

---

### Option 2: Manual Fix (If Auto-Fix Fails)

**File:** `FIX-RLS-PERFORMANCE-MANUAL.sql`

This file contains manual `DROP POLICY` and `CREATE POLICY` statements for critical tables:
- `profiles`
- `trades`
- `goals`
- `journal_entries`

**How to run:**
1. Open Supabase SQL Editor
2. Copy and paste sections for tables you want to fix
3. Run each section individually
4. Verify with the query at the end

**Time:** ~10 minutes

---

## 🔍 Verify the Fix

After running either script, verify with:

```sql
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual LIKE '%auth.uid()%' OR qual LIKE '%auth.jwt()%' 
       OR with_check LIKE '%auth.uid()%' OR with_check LIKE '%auth.jwt()%')
  AND qual NOT LIKE '%(SELECT auth.uid())%'
  AND (with_check IS NULL OR with_check NOT LIKE '%(SELECT auth.uid())%')
ORDER BY tablename, policyname;
```

**Expected:** Should return 0 rows (or very few if some policies can't be optimized)

---

## 📊 Check Supabase Advisors

After fixing, check Supabase Security Advisor:

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Advisors**
3. Check **Performance** tab
4. Should see **0** or **fewer** `auth_rls_initplan` warnings

---

## ⚡ Performance Impact

**Before:** `auth.uid()` is evaluated for EVERY row (120+ policies × millions of rows = slow)

**After:** `(SELECT auth.uid())` is evaluated ONCE per query (10-100x faster)

---

## 🛡️ Safety

Both scripts are **safe** because:
- ✅ Only modify policies that need optimization
- ✅ Preserve all original policy logic
- ✅ Auto-fix script restores original if recreation fails
- ✅ No data is modified, only security policies

---

## ❓ Troubleshooting

### "Policy already exists"
- The policy was already recreated. This is fine, just continue.

### "Permission denied"
- Make sure you're using the Supabase SQL Editor (has admin privileges)
- Or use the Supabase CLI with service role key

### "Some policies still show warnings"
- Some policies with complex CASE statements may need manual review
- Check if they're actually causing performance issues
- You can optimize them individually if needed

---

## 📝 Next Steps

After fixing RLS policies:
1. ✅ Run `FIX-DUPLICATE-INDEXES.sql` to remove duplicate indexes
2. ✅ Test your application queries to ensure RLS still works
3. ✅ Check Supabase Advisors for remaining warnings
4. ✅ Monitor query performance in Supabase Dashboard

