-- ============================================================================
-- FIX RLS PERFORMANCE: Manual Fixes for Critical Tables
-- ============================================================================
-- 
-- Use this if the auto-fix script doesn't work
-- These are the exact policy names from your database
-- ============================================================================

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

-- Drop and recreate "Users can view own profile"
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  AS PERMISSIVE FOR SELECT
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can update own profile"
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  AS PERMISSIVE FOR UPDATE
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can insert own profile"
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  AS PERMISSIVE FOR INSERT
  TO public
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Profiles service role + own"
DROP POLICY IF EXISTS "Profiles service role + own" ON public.profiles;
CREATE POLICY "Profiles service role + own" ON public.profiles
  AS PERMISSIVE FOR ALL
  TO public
  USING ((auth.role() = 'service_role'::text) OR ((SELECT auth.uid()) = user_id))
  WITH CHECK ((auth.role() = 'service_role'::text) OR ((SELECT auth.uid()) = user_id));

-- Drop and recreate "profiles_select_own"
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  AS PERMISSIVE FOR SELECT
  TO public
  USING (
    CASE
      WHEN (EXISTS (SELECT FROM pg_tables WHERE pg_tables.schemaname = 'auth'::name AND pg_tables.tablename = 'users'::name))
      THEN ((SELECT auth.uid()) = user_id)
      ELSE true
    END
  );

-- Drop and recreate "profiles_insert_own"
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  AS PERMISSIVE FOR INSERT
  TO public
  WITH CHECK (
    CASE
      WHEN (EXISTS (SELECT FROM pg_tables WHERE pg_tables.schemaname = 'auth'::name AND pg_tables.tablename = 'users'::name))
      THEN ((SELECT auth.uid()) = user_id)
      ELSE true
    END
  );

-- Drop and recreate "profiles_update_own"
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  AS PERMISSIVE FOR UPDATE
  TO public
  USING (
    CASE
      WHEN (EXISTS (SELECT FROM pg_tables WHERE pg_tables.schemaname = 'auth'::name AND pg_tables.tablename = 'users'::name))
      THEN ((SELECT auth.uid()) = user_id)
      ELSE true
    END
  );

-- Drop and recreate "profiles_delete_own"
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  AS PERMISSIVE FOR DELETE
  TO public
  USING (
    CASE
      WHEN (EXISTS (SELECT FROM pg_tables WHERE pg_tables.schemaname = 'auth'::name AND pg_tables.tablename = 'users'::name))
      THEN ((SELECT auth.uid()) = user_id)
      ELSE true
    END
  );

-- Drop and recreate "users_select_own_profiles_optimized"
DROP POLICY IF EXISTS "users_select_own_profiles_optimized" ON public.profiles;
CREATE POLICY "users_select_own_profiles_optimized" ON public.profiles
  AS PERMISSIVE FOR SELECT
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- TRADES TABLE
-- ============================================================================

-- Drop and recreate "Users can view own trades"
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
CREATE POLICY "Users can view own trades" ON public.trades
  AS PERMISSIVE FOR SELECT
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can insert own trades"
DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
CREATE POLICY "Users can insert own trades" ON public.trades
  AS PERMISSIVE FOR INSERT
  TO public
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can update own trades"
DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
CREATE POLICY "Users can update own trades" ON public.trades
  AS PERMISSIVE FOR UPDATE
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can delete own trades"
DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;
CREATE POLICY "Users can delete own trades" ON public.trades
  AS PERMISSIVE FOR DELETE
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Trades service role + own"
DROP POLICY IF EXISTS "Trades service role + own" ON public.trades;
CREATE POLICY "Trades service role + own" ON public.trades
  AS PERMISSIVE FOR ALL
  TO public
  USING ((auth.role() = 'service_role'::text) OR ((SELECT auth.uid()) = user_id))
  WITH CHECK ((auth.role() = 'service_role'::text) OR ((SELECT auth.uid()) = user_id));

-- Drop and recreate "trades_select_own"
DROP POLICY IF EXISTS "trades_select_own" ON public.trades;
CREATE POLICY "trades_select_own" ON public.trades
  AS PERMISSIVE FOR SELECT
  TO public
  USING (
    CASE
      WHEN (EXISTS (SELECT FROM pg_tables WHERE pg_tables.schemaname = 'auth'::name AND pg_tables.tablename = 'users'::name))
      THEN ((SELECT auth.uid()) = user_id)
      ELSE true
    END
  );

-- Drop and recreate "trades_insert_own"
DROP POLICY IF EXISTS "trades_insert_own" ON public.trades;
CREATE POLICY "trades_insert_own" ON public.trades
  AS PERMISSIVE FOR INSERT
  TO public
  WITH CHECK (
    CASE
      WHEN (EXISTS (SELECT FROM pg_tables WHERE pg_tables.schemaname = 'auth'::name AND pg_tables.tablename = 'users'::name))
      THEN ((SELECT auth.uid()) = user_id)
      ELSE true
    END
  );

-- Drop and recreate "trades_update_own"
DROP POLICY IF EXISTS "trades_update_own" ON public.trades;
CREATE POLICY "trades_update_own" ON public.trades
  AS PERMISSIVE FOR UPDATE
  TO public
  USING (
    CASE
      WHEN (EXISTS (SELECT FROM pg_tables WHERE pg_tables.schemaname = 'auth'::name AND pg_tables.tablename = 'users'::name))
      THEN ((SELECT auth.uid()) = user_id)
      ELSE true
    END
  );

-- Drop and recreate "trades_delete_own"
DROP POLICY IF EXISTS "trades_delete_own" ON public.trades;
CREATE POLICY "trades_delete_own" ON public.trades
  AS PERMISSIVE FOR DELETE
  TO public
  USING (
    CASE
      WHEN (EXISTS (SELECT FROM pg_tables WHERE pg_tables.schemaname = 'auth'::name AND pg_tables.tablename = 'users'::name))
      THEN ((SELECT auth.uid()) = user_id)
      ELSE true
    END
  );

-- ============================================================================
-- GOALS TABLE
-- ============================================================================

-- Drop and recreate "Users can view own goals"
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
CREATE POLICY "Users can view own goals" ON public.goals
  AS PERMISSIVE FOR SELECT
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can insert own goals"
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
CREATE POLICY "Users can insert own goals" ON public.goals
  AS PERMISSIVE FOR INSERT
  TO public
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can update own goals"
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
CREATE POLICY "Users can update own goals" ON public.goals
  AS PERMISSIVE FOR UPDATE
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can delete own goals"
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
CREATE POLICY "Users can delete own goals" ON public.goals
  AS PERMISSIVE FOR DELETE
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate "users_select_own_goals_optimized"
DROP POLICY IF EXISTS "users_select_own_goals_optimized" ON public.goals;
CREATE POLICY "users_select_own_goals_optimized" ON public.goals
  AS PERMISSIVE FOR SELECT
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- JOURNAL ENTRIES TABLE
-- ============================================================================

-- Drop and recreate "Users can view own journal entries"
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
CREATE POLICY "Users can view own journal entries" ON public.journal_entries
  AS PERMISSIVE FOR SELECT
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can insert own journal entries"
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
CREATE POLICY "Users can insert own journal entries" ON public.journal_entries
  AS PERMISSIVE FOR INSERT
  TO public
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can update own journal entries"
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
CREATE POLICY "Users can update own journal entries" ON public.journal_entries
  AS PERMISSIVE FOR UPDATE
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate "Users can delete own journal entries"
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;
CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
  AS PERMISSIVE FOR DELETE
  TO public
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- VERIFY: Check remaining policies
-- ============================================================================

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

-- Should return fewer rows after running this script

