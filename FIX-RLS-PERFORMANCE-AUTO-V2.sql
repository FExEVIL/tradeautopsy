-- ============================================================================
-- FIX RLS PERFORMANCE: Auto-Generate Optimized Policies (V2 - Improved)
-- ============================================================================
-- 
-- This script fixes ALL RLS policies by:
-- 1. Finding all policies with auth.uid() or auth.jwt() (including in with_check)
-- 2. Generating optimized versions with (SELECT auth.uid())
-- 3. Dropping and recreating them
--
-- IMPROVEMENTS:
-- - Handles policies that were partially optimized
-- - Optimizes with_check clauses that were missed
-- - Better error handling
--
-- SAFE: Only modifies policies that need optimization
-- TIME: ~5 minutes to run
-- ============================================================================

DO $$
DECLARE
  policy_rec RECORD;
  new_qual TEXT;
  new_with_check TEXT;
  policy_sql TEXT;
  optimized_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  FOR policy_rec IN 
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        -- Find policies that still have unoptimized auth.uid() or auth.jwt()
        -- Check USING clause
        (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid()%' AND qual NOT LIKE '%( SELECT auth.uid()%')
        OR (qual LIKE '%auth.jwt()%' AND qual NOT LIKE '%(SELECT auth.jwt()%' AND qual NOT LIKE '%( SELECT auth.jwt()%')
        -- Check WITH CHECK clause
        OR (with_check LIKE '%auth.uid()%' AND (with_check NOT LIKE '%(SELECT auth.uid()%' AND with_check NOT LIKE '%( SELECT auth.uid()%'))
        OR (with_check LIKE '%auth.jwt()%' AND (with_check NOT LIKE '%(SELECT auth.jwt()%' AND with_check NOT LIKE '%( SELECT auth.jwt()%'))
      )
    ORDER BY tablename, policyname
  LOOP
    -- Replace auth.uid() with (SELECT auth.uid())
    new_qual := policy_rec.qual;
    new_with_check := policy_rec.with_check;
    
    IF new_qual IS NOT NULL THEN
      -- Replace all instances of auth.uid() with (SELECT auth.uid())
      new_qual := regexp_replace(new_qual, '\mauth\.uid\(\)', '(SELECT auth.uid())', 'g');
      new_qual := regexp_replace(new_qual, '\mauth\.jwt\(\)', '(SELECT auth.jwt())', 'g');
    END IF;
    
    IF new_with_check IS NOT NULL THEN
      -- Replace all instances of auth.uid() with (SELECT auth.uid())
      new_with_check := regexp_replace(new_with_check, '\mauth\.uid\(\)', '(SELECT auth.uid())', 'g');
      new_with_check := regexp_replace(new_with_check, '\mauth\.jwt\(\)', '(SELECT auth.jwt())', 'g');
    END IF;
    
    -- Skip if nothing changed (shouldn't happen, but safety check)
    IF new_qual = policy_rec.qual AND new_with_check = policy_rec.with_check THEN
      RAISE NOTICE 'Skipping policy %.% - no changes needed', 
                   policy_rec.tablename, 
                   policy_rec.policyname;
      CONTINUE;
    END IF;
    
    -- Drop existing policy
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                     policy_rec.policyname, 
                     policy_rec.schemaname, 
                     policy_rec.tablename);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to drop policy %.%: %', 
                    policy_rec.tablename, 
                    policy_rec.policyname, 
                    SQLERRM;
      error_count := error_count + 1;
      CONTINUE;
    END;
    
    -- Build CREATE POLICY statement
    policy_sql := format('CREATE POLICY %I ON %I.%I', 
                         policy_rec.policyname,
                         policy_rec.schemaname,
                         policy_rec.tablename);
    
    -- Add permissive/restrictive
    IF policy_rec.permissive = 'PERMISSIVE' THEN
      policy_sql := policy_sql || ' AS PERMISSIVE';
    ELSE
      policy_sql := policy_sql || ' AS RESTRICTIVE';
    END IF;
    
    -- Add command (SELECT, INSERT, UPDATE, DELETE, ALL)
    policy_sql := policy_sql || format(' FOR %s', policy_rec.cmd);
    
    -- Add roles
    IF policy_rec.roles IS NOT NULL AND array_length(policy_rec.roles, 1) > 0 THEN
      policy_sql := policy_sql || format(' TO %s', array_to_string(policy_rec.roles, ', '));
    END IF;
    
    -- Add USING clause
    IF new_qual IS NOT NULL THEN
      policy_sql := policy_sql || format(' USING (%s)', new_qual);
    END IF;
    
    -- Add WITH CHECK clause
    IF new_with_check IS NOT NULL THEN
      policy_sql := policy_sql || format(' WITH CHECK (%s)', new_with_check);
    END IF;
    
    -- Execute CREATE POLICY
    BEGIN
      EXECUTE policy_sql;
      optimized_count := optimized_count + 1;
      RAISE NOTICE '[%] Optimized: %.%', optimized_count, policy_rec.tablename, policy_rec.policyname;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create policy %.%: %', 
                    policy_rec.tablename, 
                    policy_rec.policyname, 
                    SQLERRM;
      error_count := error_count + 1;
      
      -- Try to recreate original policy if optimization fails
      BEGIN
        policy_sql := format('CREATE POLICY %I ON %I.%I AS %s FOR %s',
                             policy_rec.policyname,
                             policy_rec.schemaname,
                             policy_rec.tablename,
                             policy_rec.permissive,
                             policy_rec.cmd);
        
        IF policy_rec.roles IS NOT NULL AND array_length(policy_rec.roles, 1) > 0 THEN
          policy_sql := policy_sql || format(' TO %s', array_to_string(policy_rec.roles, ', '));
        END IF;
        
        IF policy_rec.qual IS NOT NULL THEN
          policy_sql := policy_sql || format(' USING (%s)', policy_rec.qual);
        END IF;
        
        IF policy_rec.with_check IS NOT NULL THEN
          policy_sql := policy_sql || format(' WITH CHECK (%s)', policy_rec.with_check);
        END IF;
        
        EXECUTE policy_sql;
        RAISE NOTICE 'Restored original policy: %.%', policy_rec.tablename, policy_rec.policyname;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'CRITICAL: Failed to restore original policy %.%: %', 
                      policy_rec.tablename, 
                      policy_rec.policyname, 
                      SQLERRM;
      END;
    END;
  END LOOP;
  
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'RLS optimization complete!';
  RAISE NOTICE 'Optimized: % policies', optimized_count;
  RAISE NOTICE 'Errors: % policies', error_count;
  RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- VERIFY: Check remaining policies that need optimization
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN qual LIKE '%(SELECT auth.uid()%' OR qual LIKE '%( SELECT auth.uid()%'
         OR with_check LIKE '%(SELECT auth.uid()%' OR with_check LIKE '%( SELECT auth.uid()%'
    THEN 'OPTIMIZED'
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
    THEN 'Still needs optimization'
    ELSE 'N/A'
  END AS status
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual LIKE '%auth.uid()%' OR qual LIKE '%auth.jwt()%' 
    OR with_check LIKE '%auth.uid()%' OR with_check LIKE '%auth.jwt()%'
    OR qual LIKE '%(SELECT auth.uid()%' OR qual LIKE '%( SELECT auth.uid()%'
    OR with_check LIKE '%(SELECT auth.uid()%' OR with_check LIKE '%( SELECT auth.uid()%'
  )
ORDER BY status, tablename, policyname;

-- Count summary
SELECT 
  COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%') AS needs_optimization,
  COUNT(*) FILTER (WHERE qual LIKE '%(SELECT auth.uid()%' OR qual LIKE '%( SELECT auth.uid()%'
                   OR with_check LIKE '%(SELECT auth.uid()%' OR with_check LIKE '%( SELECT auth.uid()%') AS optimized
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual LIKE '%auth.uid()%' OR qual LIKE '%auth.jwt()%' 
       OR with_check LIKE '%auth.uid()%' OR with_check LIKE '%auth.jwt()%'
       OR qual LIKE '%(SELECT auth.uid()%' OR qual LIKE '%( SELECT auth.uid()%'
       OR with_check LIKE '%(SELECT auth.uid()%' OR with_check LIKE '%( SELECT auth.uid()%');

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. This script handles policies that were partially optimized
-- 2. Optimizes both USING and WITH CHECK clauses
-- 3. PostgreSQL may add "AS uid" alias - that's fine, it's still optimized
-- 4. Run Supabase Security Advisor after to verify warnings are gone
-- 5. Test your application queries to ensure RLS still works correctly
-- ============================================================================

