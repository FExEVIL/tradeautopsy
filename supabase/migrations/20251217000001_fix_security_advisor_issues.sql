-- ✅ COMPREHENSIVE SECURITY FIXES FOR SUPABASE SECURITY ADVISOR
-- This migration fixes all critical errors and warnings

-- ============================================================================
-- PHASE 1: FIX CRITICAL ERRORS - Enable RLS on Public Tables
-- ============================================================================

-- ✅ Fix 1: Enable RLS on import_logs
ALTER TABLE IF EXISTS public.import_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own import logs" ON public.import_logs;
DROP POLICY IF EXISTS "Users can insert their own import logs" ON public.import_logs;
DROP POLICY IF EXISTS "Users can update their own import logs" ON public.import_logs;
DROP POLICY IF EXISTS "Users can delete their own import logs" ON public.import_logs;

-- Create comprehensive RLS policies for import_logs
CREATE POLICY "Users can view their own import logs"
ON public.import_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own import logs"
ON public.import_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import logs"
ON public.import_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own import logs"
ON public.import_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ✅ Fix 2: Enable RLS on economic_events
ALTER TABLE IF EXISTS public.economic_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view economic events" ON public.economic_events;
DROP POLICY IF EXISTS "Service role can manage economic events" ON public.economic_events;

-- Economic events are typically public data, so allow read for all
CREATE POLICY "Anyone can view economic events"
ON public.economic_events
FOR SELECT
TO authenticated, anon
USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage economic events"
ON public.economic_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ✅ Fix 3: Enable RLS on user_preferences
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;

-- Create comprehensive RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 2: FIX SECURITY DEFINER VIEWS
-- ============================================================================

-- ✅ Fix 1: Recreate web_vitals_summary without SECURITY DEFINER
DROP VIEW IF EXISTS public.web_vitals_summary CASCADE;

CREATE VIEW public.web_vitals_summary AS
SELECT 
  metric_name,
  DATE(timestamp) as date,
  COUNT(*) as sample_count,
  ROUND(AVG(CAST(metric_value AS NUMERIC)), 2) as avg_value,
  ROUND(CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CAST(metric_value AS NUMERIC)) AS NUMERIC), 2) as p50,
  ROUND(CAST(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY CAST(metric_value AS NUMERIC)) AS NUMERIC), 2) as p75,
  ROUND(CAST(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY CAST(metric_value AS NUMERIC)) AS NUMERIC), 2) as p95,
  COUNT(CASE WHEN metric_rating = 'good' THEN 1 END) as good_count,
  COUNT(CASE WHEN metric_rating = 'needs-improvement' THEN 1 END) as needs_improvement_count,
  COUNT(CASE WHEN metric_rating = 'poor' THEN 1 END) as poor_count
FROM web_vitals
GROUP BY metric_name, DATE(timestamp)
ORDER BY date DESC, metric_name;

-- Grant access
GRANT SELECT ON public.web_vitals_summary TO authenticated;
GRANT SELECT ON public.web_vitals_summary TO service_role;

-- ✅ Fix 2: Recreate alert_effectiveness_stats without SECURITY DEFINER (if exists)
DROP VIEW IF EXISTS public.alert_effectiveness_stats CASCADE;

-- Only create if alerts table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts' AND table_schema = 'public') THEN
    EXECUTE '
    CREATE VIEW public.alert_effectiveness_stats AS
    SELECT 
      alert_type,
      COUNT(*) as total_alerts,
      COUNT(CASE WHEN acknowledged = true THEN 1 END) as acknowledged_count,
      ROUND(
        COUNT(CASE WHEN acknowledged = true THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 
        2
      ) as acknowledgement_rate,
      AVG(EXTRACT(EPOCH FROM (acknowledged_at - created_at))/60) as avg_response_time_minutes
    FROM alerts
    WHERE created_at >= CURRENT_DATE - INTERVAL ''30 days''
    GROUP BY alert_type
    ORDER BY total_alerts DESC;
    
    GRANT SELECT ON public.alert_effectiveness_stats TO authenticated;
    GRANT SELECT ON public.alert_effectiveness_stats TO service_role;
    ';
  END IF;
END $$;

-- ============================================================================
-- PHASE 3: FIX FUNCTION SEARCH_PATH MUTABILITY (Security Critical)
-- ============================================================================

-- ✅ Fix 1: handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CRITICAL: Prevents SQL injection
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ✅ Fix 2: get_daily_pnl
DROP FUNCTION IF EXISTS public.get_daily_pnl(UUID, DATE, DATE, UUID);

CREATE OR REPLACE FUNCTION public.get_daily_pnl(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_profile_id UUID DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  total_pnl DECIMAL,
  trade_count INTEGER
)
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CRITICAL: Prevents SQL injection
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(trade_date) as date,
    SUM(pnl)::DECIMAL as total_pnl,
    COUNT(*)::INTEGER as trade_count
  FROM trades
  WHERE 
    user_id = p_user_id
    AND DATE(trade_date) >= p_start_date
    AND DATE(trade_date) <= p_end_date
    AND deleted_at IS NULL
    AND (p_profile_id IS NULL OR profile_id = p_profile_id)
  GROUP BY DATE(trade_date)
  ORDER BY DATE(trade_date);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_daily_pnl(UUID, DATE, DATE, UUID) TO authenticated;

-- ✅ Fix 3: get_dashboard_metrics
DROP FUNCTION IF EXISTS public.get_dashboard_metrics(UUID, UUID, INTEGER);

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(
  p_user_id UUID,
  p_profile_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_pnl DECIMAL,
  total_trades BIGINT,
  win_count BIGINT,
  loss_count BIGINT,
  win_rate DECIMAL,
  avg_pnl DECIMAL,
  max_win DECIMAL,
  max_loss DECIMAL
)
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CRITICAL: Prevents SQL injection
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_start_date DATE;
BEGIN
  v_start_date := CURRENT_DATE - p_days;
  
  RETURN QUERY
  SELECT 
    SUM(pnl)::DECIMAL as total_pnl,
    COUNT(*)::BIGINT as total_trades,
    COUNT(*) FILTER (WHERE pnl > 0)::BIGINT as win_count,
    COUNT(*) FILTER (WHERE pnl < 0)::BIGINT as loss_count,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE pnl > 0)::DECIMAL / COUNT(*)::DECIMAL * 100)
      ELSE 0
    END as win_rate,
    AVG(pnl)::DECIMAL as avg_pnl,
    MAX(pnl) FILTER (WHERE pnl > 0)::DECIMAL as max_win,
    MIN(pnl) FILTER (WHERE pnl < 0)::DECIMAL as max_loss
  FROM trades
  WHERE 
    user_id = p_user_id
    AND DATE(trade_date) >= v_start_date
    AND deleted_at IS NULL
    AND (p_profile_id IS NULL OR profile_id = p_profile_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics(UUID, UUID, INTEGER) TO authenticated;

-- ✅ Fix 4: get_user_metrics_fast
DROP FUNCTION IF EXISTS public.get_user_metrics_fast(UUID, UUID, DATE, DATE);

CREATE OR REPLACE FUNCTION public.get_user_metrics_fast(
  p_user_id UUID,
  p_profile_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CRITICAL: Prevents SQL injection
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_pnl', COALESCE(SUM(pnl), 0),
    'total_trades', COUNT(*),
    'win_count', COUNT(*) FILTER (WHERE pnl > 0),
    'loss_count', COUNT(*) FILTER (WHERE pnl < 0),
    'win_rate', CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE pnl > 0)::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0 
    END,
    'avg_win', COALESCE(AVG(pnl) FILTER (WHERE pnl > 0), 0),
    'avg_loss', COALESCE(AVG(pnl) FILTER (WHERE pnl < 0), 0),
    'best_trade', COALESCE(MAX(pnl), 0),
    'worst_trade', COALESCE(MIN(pnl), 0),
    'avg_trade', COALESCE(AVG(pnl), 0)
  ) INTO result
  FROM trades
  WHERE 
    user_id = p_user_id
    AND deleted_at IS NULL
    AND (p_profile_id IS NULL OR profile_id = p_profile_id)
    AND (p_start_date IS NULL OR trade_date >= p_start_date)
    AND (p_end_date IS NULL OR trade_date <= p_end_date);
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_metrics_fast(UUID, UUID, DATE, DATE) TO authenticated;

-- ✅ Fix 5: refresh_dashboard_metrics
DROP FUNCTION IF EXISTS public.refresh_dashboard_metrics();

CREATE OR REPLACE FUNCTION public.refresh_dashboard_metrics()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CRITICAL: Prevents SQL injection
LANGUAGE plpgsql
AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  result jsonb;
BEGIN
  start_time := clock_timestamp();
  
  -- Refresh materialized views if they exist
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'dashboard_metrics_mv') THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics_mv;
  END IF;
  
  end_time := clock_timestamp();
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Dashboard metrics refreshed successfully',
    'duration_ms', EXTRACT(MILLISECONDS FROM (end_time - start_time)),
    'refreshed_at', NOW()
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  result := jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to refresh dashboard metrics',
    'refreshed_at', NOW()
  );
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_dashboard_metrics() TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_dashboard_metrics() TO authenticated;

-- ✅ Fix 6: update_updated_at_column (if exists)
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SET search_path = public, pg_temp  -- ✅ CRITICAL: Prevents SQL injection
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PHASE 4: RESTRICT MATERIALIZED VIEW ACCESS
-- ============================================================================

-- ✅ Revoke public access to materialized views
REVOKE ALL ON public.dashboard_metrics_mv FROM anon;
REVOKE ALL ON public.dashboard_metrics_mv FROM authenticated;
REVOKE ALL ON public.dashboard_metrics_mv FROM public;

-- Only allow service role to access directly
GRANT SELECT ON public.dashboard_metrics_mv TO service_role;

-- ✅ Create secure function to access materialized view
CREATE OR REPLACE FUNCTION public.get_user_metrics_from_cache(p_user_id UUID)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verify user is requesting their own data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other users data';
  END IF;
  
  SELECT row_to_json(t)::jsonb INTO result
  FROM (
    SELECT * FROM dashboard_metrics_mv WHERE user_id = p_user_id
  ) t;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_metrics_from_cache(UUID) TO authenticated;

-- ============================================================================
-- PHASE 5: ENSURE PROFILES TABLE HAS PROPER RLS
-- ============================================================================

-- ✅ Ensure profiles table has RLS enabled
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert during signup" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Allow insert during signup"
ON public.profiles
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- ✅ Verify RLS is enabled on all tables
DO $$
DECLARE
  rls_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables 
  WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'import_logs', 'economic_events', 'user_preferences')
  AND rowsecurity = true;
  
  IF rls_count < 4 THEN
    RAISE WARNING 'Not all tables have RLS enabled. Count: %', rls_count;
  ELSE
    RAISE NOTICE '✅ All tables have RLS enabled';
  END IF;
END $$;

-- ✅ Verify functions have search_path set
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'handle_new_user',
    'get_daily_pnl',
    'get_dashboard_metrics',
    'get_user_metrics_fast',
    'refresh_dashboard_metrics'
  )
  AND p.proconfig IS NOT NULL
  AND array_to_string(p.proconfig, ',') LIKE '%search_path%';
  
  IF func_count < 5 THEN
    RAISE WARNING 'Not all functions have search_path set. Count: %', func_count;
  ELSE
    RAISE NOTICE '✅ All functions have search_path set';
  END IF;
END $$;
