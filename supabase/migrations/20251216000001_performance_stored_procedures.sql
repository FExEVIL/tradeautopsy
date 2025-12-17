-- ✅ Create fast stored procedure for dashboard metrics (runs on database server)
CREATE OR REPLACE FUNCTION get_user_metrics_fast(
  p_user_id UUID,
  p_profile_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- ✅ Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_metrics_fast(UUID, UUID, DATE, DATE) TO authenticated;

-- ✅ Create materialized view for dashboard (refreshed periodically)
-- This provides instant lookups for dashboard metrics (TTFB optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_metrics_mv AS
SELECT 
  user_id,
  profile_id,
  COUNT(*) as total_trades,
  SUM(pnl) as total_pnl,
  COUNT(*) FILTER (WHERE pnl > 0) as win_count,
  COUNT(*) FILTER (WHERE pnl < 0) as loss_count,
  CASE 
    WHEN COUNT(*) > 0 
    THEN ROUND((COUNT(*) FILTER (WHERE pnl > 0)::DECIMAL / COUNT(*)) * 100, 2)
    ELSE 0 
  END as win_rate,
  AVG(pnl) FILTER (WHERE pnl > 0) as avg_win,
  AVG(pnl) FILTER (WHERE pnl < 0) as avg_loss,
  MAX(pnl) as best_trade,
  MIN(pnl) as worst_trade,
  AVG(pnl) as avg_trade,
  MAX(trade_date) as last_trade_date
FROM trades
WHERE deleted_at IS NULL
GROUP BY user_id, profile_id;

-- ✅ Create unique index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_mv_user 
ON dashboard_metrics_mv(user_id);

-- ✅ Index for profile-specific queries
CREATE INDEX IF NOT EXISTS idx_dashboard_mv_user_profile 
ON dashboard_metrics_mv(user_id, profile_id) WHERE profile_id IS NOT NULL;

-- ✅ Auto-refresh function for materialized view
-- Returns JSONB for better error handling and logging
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

-- ✅ Grant execute to service role (for cron jobs)
GRANT EXECUTE ON FUNCTION refresh_dashboard_metrics() TO service_role;
GRANT EXECUTE ON FUNCTION refresh_dashboard_metrics() TO authenticated;
