-- ============================================================================
-- FIX RLS PERFORMANCE: Auto-Generate Optimized Policies
-- ============================================================================
-- 
-- This script automatically fixes ALL RLS policies by:
-- 1. Finding all policies with auth.uid() or auth.jwt()
-- 2. Generating optimized versions with (SELECT auth.uid())
-- 3. Dropping and recreating them
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
      AND (qual LIKE '%auth.uid()%' OR qual LIKE '%auth.jwt()%' 
           OR with_check LIKE '%auth.uid()%' OR with_check LIKE '%auth.jwt()%')
      -- Exclude policies that already use (SELECT auth.uid())
      AND qual NOT LIKE '%(SELECT auth.uid())%'
      AND (with_check IS NULL OR with_check NOT LIKE '%(SELECT auth.uid())%')
    ORDER BY tablename, policyname
  LOOP
    -- Replace auth.uid() with (SELECT auth.uid())
    new_qual := policy_rec.qual;
    new_with_check := policy_rec.with_check;
    
    IF new_qual IS NOT NULL THEN
      new_qual := regexp_replace(new_qual, 'auth\.uid\(\)', '(SELECT auth.uid())', 'g');
      new_qual := regexp_replace(new_qual, 'auth\.jwt\(\)', '(SELECT auth.jwt())', 'g');
    END IF;
    
    IF new_with_check IS NOT NULL THEN
      new_with_check := regexp_replace(new_with_check, 'auth\.uid\(\)', '(SELECT auth.uid())', 'g');
      new_with_check := regexp_replace(new_with_check, 'auth\.jwt\(\)', '(SELECT auth.jwt())', 'g');
    END IF;
    
    -- Drop existing policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                   policy_rec.policyname, 
                   policy_rec.schemaname, 
                   policy_rec.tablename);
    
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
      RAISE NOTICE 'Optimized policy: %.%', policy_rec.tablename, policy_rec.policyname;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create policy %.%: %', 
                    policy_rec.tablename, 
                    policy_rec.policyname, 
                    SQLERRM;
      -- Recreate original policy if optimization fails
      EXECUTE format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s%s%s',
                     policy_rec.policyname,
                     policy_rec.schemaname,
                     policy_rec.tablename,
                     policy_rec.permissive,
                     policy_rec.cmd,
                     array_to_string(policy_rec.roles, ', '),
                     CASE WHEN policy_rec.qual IS NOT NULL THEN format(' USING (%s)', policy_rec.qual) ELSE '' END,
                     CASE WHEN policy_rec.with_check IS NOT NULL THEN format(' WITH CHECK (%s)', policy_rec.with_check) ELSE '' END);
    END;
  END LOOP;
  
  RAISE NOTICE 'RLS optimization complete!';
END $$;

-- ============================================================================
-- VERIFY: Check remaining policies that need optimization
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  'Still needs optimization' AS status
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual LIKE '%auth.uid()%' OR qual LIKE '%auth.jwt()%' 
       OR with_check LIKE '%auth.uid()%' OR with_check LIKE '%auth.jwt()%')
  -- Exclude already optimized
  AND qual NOT LIKE '%(SELECT auth.uid())%'
  AND (with_check IS NULL OR with_check NOT LIKE '%(SELECT auth.uid())%')
ORDER BY tablename, policyname;

-- Should return 0 rows after optimization

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. This script is SAFE - it only modifies policies that need optimization
-- 2. If a policy recreation fails, it restores the original
-- 3. Run Supabase Security Advisor after to verify warnings are gone
-- 4. Test your application queries to ensure RLS still works correctly
-- ============================================================================

