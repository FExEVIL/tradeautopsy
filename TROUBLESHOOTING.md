# Troubleshooting Guide

## "Failed to fetch" Errors

If you see "Failed to fetch" errors in the console, they're likely from new features that require database migrations to be run first.

### Common Causes

1. **Morning Brief API** (`/api/morning-brief`)
   - **Error:** "Failed to fetch" when loading dashboard
   - **Cause:** `morning_brief_last_read` column doesn't exist in `user_preferences` table
   - **Fix:** Run migration `20251209000003_add_user_preferences_fields.sql`
   - **Status:** Component handles this gracefully - will auto-dismiss if API fails

2. **Notifications** (NotificationBell component)
   - **Error:** "Failed to fetch" when loading notifications
   - **Cause:** `notifications` table doesn't exist
   - **Fix:** Run migration `20251209000002_add_economic_events_and_notifications.sql`
   - **Status:** Component handles this gracefully - shows empty state

3. **Profiles** (ProfileSwitcher component)
   - **Error:** "Failed to fetch" when loading profiles
   - **Cause:** `profiles` table doesn't exist
   - **Fix:** Run migration `20251209000000_add_soft_delete_and_profiles.sql`
   - **Status:** Component handles this gracefully - hides if no profiles

### Solutions

**Option 1: Run All Migrations (Recommended)**

Run these migrations in order:
```sql
1. 20251209000000_add_soft_delete_and_profiles.sql
2. 20251209000001_add_brokers_tables.sql
3. 20251209000002_add_economic_events_and_notifications.sql
4. 20251209000003_add_user_preferences_fields.sql
5. 20251209000004_add_audio_journal_and_ml_insights.sql
```

**Option 2: Disable Features Temporarily**

If you don't want to run migrations yet, the components will gracefully handle missing tables and won't crash the app. They'll just:
- MorningBrief: Auto-dismiss if API fails
- NotificationBell: Show empty state
- ProfileSwitcher: Hide if no profiles

### Verification

After running migrations, verify tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'profiles', 
  'brokers', 
  'notifications', 
  'economic_events',
  'audio_journal_entries',
  'ml_insights'
);
```

### Build Errors Fixed

✅ Fixed TypeScript errors:
- Added `trade_id`, `profile_id`, `broker_id`, `deleted_at` to Trade interface
- Added `strategy` to Trade interface
- Made `side` optional for backward compatibility
- Fixed `.is('deleted_at', null)` query order

**Build Status:** ✅ Compiles successfully

---

## Next Steps

1. **Run Migrations** - Execute all 5 new migrations
2. **Test Features** - Verify each new feature works
3. **Check Console** - "Failed to fetch" errors should disappear after migrations

The app will work without migrations, but new features won't function until tables are created.
