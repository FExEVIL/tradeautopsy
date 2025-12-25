-- ============================================================================
-- FIX RLS PERFORMANCE: Final Fix for Remaining Policies
-- ============================================================================
-- 
-- This script fixes the remaining INSERT policies that have auth.uid() 
-- in their WITH CHECK clauses.
--
-- The V2 script optimized USING clauses but missed some WITH CHECK clauses.
-- This script specifically targets those remaining policies.
--
-- SAFE: Only modifies policies that need optimization
-- TIME: ~2 minutes to run
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
        -- Find policies with unoptimized auth.uid() in USING clause (must have auth.uid() but NOT optimized version)
        (qual IS NOT NULL 
         AND qual LIKE '%auth.uid()%' 
         AND qual NOT LIKE '%(SELECT auth.uid()%' 
         AND qual NOT LIKE '%( SELECT auth.uid()%'
         AND qual NOT LIKE '%(SELECT auth.uid() AS%'
         AND qual NOT LIKE '%( SELECT auth.uid() AS%')
        OR (qual IS NOT NULL 
            AND qual LIKE '%auth.jwt()%' 
            AND qual NOT LIKE '%(SELECT auth.jwt()%' 
            AND qual NOT LIKE '%( SELECT auth.jwt()%'
            AND qual NOT LIKE '%(SELECT auth.jwt() AS%'
            AND qual NOT LIKE '%( SELECT auth.jwt() AS%')
        -- Find policies with unoptimized auth.uid() in WITH CHECK clause
        OR (with_check IS NOT NULL 
            AND with_check LIKE '%auth.uid()%' 
            AND with_check NOT LIKE '%(SELECT auth.uid()%' 
            AND with_check NOT LIKE '%( SELECT auth.uid()%'
            AND with_check NOT LIKE '%(SELECT auth.uid() AS%'
            AND with_check NOT LIKE '%( SELECT auth.uid() AS%')
        OR (with_check IS NOT NULL 
            AND with_check LIKE '%auth.jwt()%' 
            AND with_check NOT LIKE '%(SELECT auth.jwt()%' 
            AND with_check NOT LIKE '%( SELECT auth.jwt()%'
            AND with_check NOT LIKE '%(SELECT auth.jwt() AS%'
            AND with_check NOT LIKE '%( SELECT auth.jwt() AS%')
      )
    ORDER BY tablename, policyname
  LOOP
    -- Replace auth.uid() with (SELECT auth.uid())
    new_qual := policy_rec.qual;
    new_with_check := policy_rec.with_check;
    
    -- Optimize USING clause if needed (only if not already optimized)
    IF new_qual IS NOT NULL THEN
      IF new_qual LIKE '%auth.uid()%' 
         AND new_qual NOT LIKE '%(SELECT auth.uid()%' 
         AND new_qual NOT LIKE '%( SELECT auth.uid()%'
         AND new_qual NOT LIKE '%(SELECT auth.uid() AS%'
         AND new_qual NOT LIKE '%( SELECT auth.uid() AS%' THEN
        new_qual := regexp_replace(new_qual, '\mauth\.uid\(\)', '(SELECT auth.uid())', 'g');
      END IF;
      IF new_qual LIKE '%auth.jwt()%' 
         AND new_qual NOT LIKE '%(SELECT auth.jwt()%' 
         AND new_qual NOT LIKE '%( SELECT auth.jwt()%'
         AND new_qual NOT LIKE '%(SELECT auth.jwt() AS%'
         AND new_qual NOT LIKE '%( SELECT auth.jwt() AS%' THEN
        new_qual := regexp_replace(new_qual, '\mauth\.jwt\(\)', '(SELECT auth.jwt())', 'g');
      END IF;
    END IF;
    
    -- Optimize WITH CHECK clause if needed (only if not already optimized)
    IF new_with_check IS NOT NULL THEN
      IF new_with_check LIKE '%auth.uid()%' 
         AND new_with_check NOT LIKE '%(SELECT auth.uid()%' 
         AND new_with_check NOT LIKE '%( SELECT auth.uid()%'
         AND new_with_check NOT LIKE '%(SELECT auth.uid() AS%'
         AND new_with_check NOT LIKE '%( SELECT auth.uid() AS%' THEN
        new_with_check := regexp_replace(new_with_check, '\mauth\.uid\(\)', '(SELECT auth.uid())', 'g');
      END IF;
      IF new_with_check LIKE '%auth.jwt()%' 
         AND new_with_check NOT LIKE '%(SELECT auth.jwt()%' 
         AND new_with_check NOT LIKE '%( SELECT auth.jwt()%'
         AND new_with_check NOT LIKE '%(SELECT auth.jwt() AS%'
         AND new_with_check NOT LIKE '%( SELECT auth.jwt() AS%' THEN
        new_with_check := regexp_replace(new_with_check, '\mauth\.jwt\(\)', '(SELECT auth.jwt())', 'g');
      END IF;
    END IF;
    
    -- Skip if nothing changed
    IF new_qual = policy_rec.qual AND new_with_check = policy_rec.with_check THEN
      CONTINUE;
    END IF;
    
    -- Drop existing policy (use IF EXISTS to avoid errors if already dropped)
    -- This is safe - if policy doesn't exist, we'll just create it
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
    
    -- Add USING clause (use optimized version)
    IF new_qual IS NOT NULL THEN
      policy_sql := policy_sql || format(' USING (%s)', new_qual);
    END IF;
    
    -- Add WITH CHECK clause (use optimized version)
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
  COUNT(*) FILTER (
    WHERE (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid()%' AND qual NOT LIKE '%( SELECT auth.uid()%')
       OR (qual LIKE '%auth.jwt()%' AND qual NOT LIKE '%(SELECT auth.jwt()%' AND qual NOT LIKE '%( SELECT auth.jwt()%')
       OR (with_check LIKE '%auth.uid()%' AND (with_check NOT LIKE '%(SELECT auth.uid()%' AND with_check NOT LIKE '%( SELECT auth.uid()%'))
       OR (with_check LIKE '%auth.jwt()%' AND (with_check NOT LIKE '%(SELECT auth.jwt()%' AND with_check NOT LIKE '%( SELECT auth.jwt()%'))
  ) AS still_needs_optimization,
  COUNT(*) FILTER (
    WHERE (qual LIKE '%(SELECT auth.uid()%' OR qual LIKE '%( SELECT auth.uid()%'
           OR qual LIKE '%(SELECT auth.jwt()%' OR qual LIKE '%( SELECT auth.jwt()%'
           OR with_check LIKE '%(SELECT auth.uid()%' OR with_check LIKE '%( SELECT auth.uid()%'
           OR with_check LIKE '%(SELECT auth.jwt()%' OR with_check LIKE '%( SELECT auth.jwt()%')
  ) AS already_optimized
FROM pg_policies
WHERE schemaname = 'public';

-- Should show 0 still_needs_optimization after running this script

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. This script specifically targets policies with unoptimized WITH CHECK clauses
-- 2. It preserves already-optimized USING clauses
-- 3. Run Supabase Security Advisor after to verify all warnings are gone
-- 4. Test your application queries to ensure RLS still works correctly
-- ============================================================================

