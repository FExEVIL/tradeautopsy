# Remaining Security Fixes

## ✅ RLS Performance Optimization: COMPLETE

All RLS policies have been optimized. The `auth_rls_initplan` warnings are gone!

## 🔒 Remaining Security Warnings (3)

### 1. Materialized View in API - `v_recent_trades` ⚠️
**Issue**: Materialized view is accessible via Supabase Data API  
**Risk**: Medium - Could expose data if not properly secured  
**Fix**: Run `FIX-MATERIALIZED-VIEWS-SECURITY.sql`

### 2. Materialized View in API - `v_dashboard_summary` ⚠️
**Issue**: Materialized view is accessible via Supabase Data API  
**Risk**: Medium - Could expose data if not properly secured  
**Fix**: Run `FIX-MATERIALIZED-VIEWS-SECURITY.sql`

### 3. Leaked Password Protection Disabled ⚠️
**Issue**: Supabase Auth doesn't check passwords against HaveIBeenPwned  
**Risk**: Low-Medium - Users can use compromised passwords  
**Fix**: Enable in Supabase Dashboard (see `FIX-LEAKED-PASSWORD-PROTECTION.md`)

---

## Quick Fix Guide

### Step 1: Fix Materialized Views (2 minutes)

1. Open Supabase SQL Editor
2. Copy and paste `FIX-MATERIALIZED-VIEWS-SECURITY.sql`
3. Click **Run**
4. Verify: Should see only `service_role` has access

**Result**: Materialized views are no longer accessible via API

### Step 2: Enable Leaked Password Protection (1 minute)

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **Password** section
3. Enable **"Leaked password protection"**
4. Click **Save**

**Result**: Users can no longer use compromised passwords

---

## After Fixes

1. **Run Supabase Security Advisor again**
   - Should show **0 warnings** (or only informational)
   
2. **Test Your Application**
   - Materialized views should still work via service_role
   - Password signup should reject compromised passwords

3. **Verify**
   - Check Security Advisor → Warnings tab
   - Should be empty or only show informational items

---

## Files Created

- ✅ `FIX-MATERIALIZED-VIEWS-SECURITY.sql` - SQL to revoke API access
- ✅ `FIX-LEAKED-PASSWORD-PROTECTION.md` - Instructions to enable password protection
- ✅ `REMAINING-SECURITY-FIXES.md` - This file

---

## Summary

- ✅ **RLS Performance**: Complete (all policies optimized)
- ⚠️ **Materialized Views**: Need to run SQL fix
- ⚠️ **Password Protection**: Need to enable in dashboard

**Total time to fix remaining issues: ~3 minutes**

