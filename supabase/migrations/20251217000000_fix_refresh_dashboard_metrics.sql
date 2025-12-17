-- ✅ Fix refresh_dashboard_metrics function to return JSONB
-- This migration updates the function to return proper JSONB response for better error handling

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS refresh_dashboard_metrics();

-- ✅ Create refresh function that returns JSONB
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS jsonb AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  result jsonb;
BEGIN
  start_time := clock_timestamp();
  
  -- Refresh the materialized view
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics_mv;
  
  end_time := clock_timestamp();
  
  -- Return success result
  result := jsonb_build_object(
    'success', true,
    'message', 'Dashboard metrics refreshed successfully',
    'duration_ms', EXTRACT(MILLISECONDS FROM (end_time - start_time)),
    'refreshed_at', NOW()
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error result
  result := jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to refresh dashboard metrics',
    'refreshed_at', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ Grant execute permissions
GRANT EXECUTE ON FUNCTION refresh_dashboard_metrics() TO service_role;
GRANT EXECUTE ON FUNCTION refresh_dashboard_metrics() TO authenticated;

-- ✅ Verify function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'refresh_dashboard_metrics'
  ) THEN
    RAISE EXCEPTION 'Function refresh_dashboard_metrics not created';
  END IF;
END $$;
