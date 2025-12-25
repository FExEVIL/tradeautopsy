-- ============================================================================
-- FIX: Materialized Views Security - Remove API Access
-- ============================================================================
-- 
-- ISSUE: Materialized views are accessible via Supabase Data API
-- FIX: Revoke access from anon and authenticated roles
--
-- This prevents materialized views from being queried directly via the API.
-- They should only be accessible through RLS-protected tables or functions.
--
-- TIME: ~1 minute to run
-- ============================================================================

-- ============================================================================
-- STEP 1: Revoke SELECT access from anon and authenticated roles
-- ============================================================================

-- Revoke access from v_recent_trades
REVOKE SELECT ON public.v_recent_trades FROM anon;
REVOKE SELECT ON public.v_recent_trades FROM authenticated;
REVOKE SELECT ON public.v_recent_trades FROM public;

-- Revoke access from v_dashboard_summary
REVOKE SELECT ON public.v_dashboard_summary FROM anon;
REVOKE SELECT ON public.v_dashboard_summary FROM authenticated;
REVOKE SELECT ON public.v_dashboard_summary FROM public;

-- ============================================================================
-- STEP 2: Grant access only to service_role (for internal use)
-- ============================================================================

-- Grant access to service_role only (for server-side operations)
GRANT SELECT ON public.v_recent_trades TO service_role;
GRANT SELECT ON public.v_dashboard_summary TO service_role;

-- ============================================================================
-- STEP 3: Verify changes
-- ============================================================================

-- Check current grants (should show only service_role)
SELECT 
  table_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('v_recent_trades', 'v_dashboard_summary')
ORDER BY table_name, grantee;

-- Expected result: Only service_role should have SELECT access

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Materialized views are now only accessible via service_role
-- 2. If your application needs to query these views, create RLS-protected functions
-- 3. Example function:
--    CREATE OR REPLACE FUNCTION get_recent_trades(user_id UUID)
--    RETURNS TABLE(...) 
--    LANGUAGE plpgsql
--    SECURITY DEFINER
--    AS $$
--    BEGIN
--      RETURN QUERY
--      SELECT * FROM v_recent_trades WHERE user_id = get_recent_trades.user_id;
--    END;
--    $$;
-- 4. Run Supabase Security Advisor again to verify warnings are gone
-- ============================================================================

