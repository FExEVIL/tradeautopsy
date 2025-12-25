-- ============================================================================
-- FIX DUPLICATE INDEXES: Remove Redundant Indexes
-- ============================================================================
-- 
-- PROBLEM: 14 duplicate indexes on same columns
-- SOLUTION: Drop all but one of each duplicate set
--
-- IMPACT: Faster writes, less storage, cleaner schema
-- TIME: ~5 minutes to run
-- ============================================================================

-- ============================================================================
-- STEP 1: View all duplicate indexes
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    -- Duplicate index sets identified by Supabase Advisor
    'idx_ai_insights_user', 'idx_insights_user_created',
    'idx_audio_journal_created', 'idx_audio_journal_user', 'idx_audio_journal_user_date', 
    'idx_audio_journal_user_date_optimized', 'idx_journal_user_created',
    'idx_detected_patterns_user', 'idx_patterns_user_detected', 'idx_patterns_user_detected_optimized',
    'idx_detected_patterns_type', 'idx_patterns_type_optimized',
    'idx_goals_profile', 'idx_goals_profile_id',
    'idx_goals_active_optimized', 'idx_goals_user_completed',
    'idx_goals_user', 'idx_goals_user_created', 'idx_goals_user_optimized',
    'idx_journal_trade', 'idx_journal_trade_optimized',
    'idx_journal_user_date', 'idx_journal_user_date_optimized',
    'idx_profiles_user_id', 'idx_profiles_user_optimized',
    'idx_profiles_user', 'idx_profiles_user_created',
    'idx_profiles_workos_id', 'idx_profiles_workos_user_id',
    'idx_trades_trade_date', 'trades_trade_date_idx',
    'idx_trades_user_id', 'trades_user_id_idx'
  )
ORDER BY tablename, indexname;

-- ============================================================================
-- STEP 2: Drop duplicate indexes (keeping the most descriptive name)
-- ============================================================================

-- AI Insights: Keep idx_ai_insights_user, drop idx_insights_user_created
DROP INDEX IF EXISTS public.idx_insights_user_created;

-- Audio Journal Entries: Keep idx_audio_journal_user_date_optimized, drop others
DROP INDEX IF EXISTS public.idx_audio_journal_created;
DROP INDEX IF EXISTS public.idx_audio_journal_user;
DROP INDEX IF EXISTS public.idx_audio_journal_user_date;
DROP INDEX IF EXISTS public.idx_journal_user_created;

-- Detected Patterns: Keep idx_patterns_user_detected_optimized, drop others
DROP INDEX IF EXISTS public.idx_detected_patterns_user;
DROP INDEX IF EXISTS public.idx_patterns_user_detected;

-- Detected Patterns Type: Keep idx_patterns_type_optimized, drop idx_detected_patterns_type
DROP INDEX IF EXISTS public.idx_detected_patterns_type;

-- Goals: Keep idx_goals_profile_id, drop idx_goals_profile
DROP INDEX IF EXISTS public.idx_goals_profile;

-- Goals: Keep idx_goals_user_optimized, drop idx_goals_active_optimized and idx_goals_user_completed
-- (Note: These might be on different columns, verify first)
-- DROP INDEX IF EXISTS public.idx_goals_active_optimized;
-- DROP INDEX IF EXISTS public.idx_goals_user_completed;

-- Goals: Keep idx_goals_user_optimized, drop idx_goals_user and idx_goals_user_created
DROP INDEX IF EXISTS public.idx_goals_user;
DROP INDEX IF EXISTS public.idx_goals_user_created;

-- Journal Entries: Keep idx_journal_trade_optimized, drop idx_journal_trade
DROP INDEX IF EXISTS public.idx_journal_trade;

-- Journal Entries: Keep idx_journal_user_date_optimized, drop idx_journal_user_date
DROP INDEX IF EXISTS public.idx_journal_user_date;

-- Profiles: Keep idx_profiles_user_optimized, drop idx_profiles_user_id
DROP INDEX IF EXISTS public.idx_profiles_user_id;

-- Profiles: Keep idx_profiles_user_created, drop idx_profiles_user
DROP INDEX IF EXISTS public.idx_profiles_user;

-- Profiles: Keep idx_profiles_workos_user_id, drop idx_profiles_workos_id
DROP INDEX IF EXISTS public.idx_profiles_workos_id;

-- Trades: Keep idx_trades_trade_date, drop trades_trade_date_idx
DROP INDEX IF EXISTS public.trades_trade_date_idx;

-- Trades: Keep idx_trades_user_id, drop trades_user_id_idx
DROP INDEX IF EXISTS public.trades_user_id_idx;

-- ============================================================================
-- STEP 3: Verify all duplicates are removed
-- ============================================================================

-- Check for remaining duplicates by comparing index definitions
WITH index_defs AS (
  SELECT 
    tablename,
    indexname,
    indexdef,
    -- Extract column names from index definition
    regexp_replace(
      regexp_replace(indexdef, '.*\(([^)]+)\).*', '\1', 'g'),
      '\s+',
      '',
      'g'
    ) AS columns
  FROM pg_indexes
  WHERE schemaname = 'public'
)
SELECT 
  i1.tablename,
  i1.indexname AS index1,
  i2.indexname AS index2,
  i1.columns
FROM index_defs i1
JOIN index_defs i2 ON i1.tablename = i2.tablename 
  AND i1.indexname < i2.indexname
  AND i1.columns = i2.columns
ORDER BY i1.tablename, i1.indexname;

-- Should return 0 rows after all duplicates are removed

-- ============================================================================
-- STEP 4: Analyze tables after index removal
-- ============================================================================

-- Rebuild statistics for affected tables
ANALYZE public.profiles;
ANALYZE public.trades;
ANALYZE public.goals;
ANALYZE public.journal_entries;
ANALYZE public.audio_journal_entries;
ANALYZE public.detected_patterns;
ANALYZE public.ai_insights;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Always keep the most descriptive/indexed name
-- 2. Prefer "_optimized" suffix indexes (they're newer)
-- 3. Verify query performance after dropping indexes
-- 4. Can recreate if needed: CREATE INDEX idx_name ON table(columns)
-- 5. Run Supabase Security Advisor after to verify warnings are gone
-- ============================================================================

