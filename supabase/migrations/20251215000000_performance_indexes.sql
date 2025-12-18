-- Performance optimization indexes for TradeAutopsy
-- Run this migration to improve query performance

-- ✅ Index for trades by user and date (most common query)
-- Note: Removed CONCURRENTLY as it cannot run in transaction blocks
-- These indexes will be created during migration (acceptable for new/small databases)
CREATE INDEX IF NOT EXISTS idx_trades_user_date 
ON trades(user_id, trade_date DESC)
WHERE deleted_at IS NULL;

-- ✅ Index for trades P&L queries
CREATE INDEX IF NOT EXISTS idx_trades_pnl 
ON trades(user_id, pnl) 
WHERE pnl IS NOT NULL AND deleted_at IS NULL;

-- ✅ Index for journal entries
CREATE INDEX IF NOT EXISTS idx_journal_user_created 
ON audio_journal_entries(user_id, created_at DESC);

-- ✅ Index for goals
CREATE INDEX IF NOT EXISTS idx_goals_user_status 
ON goals(user_id, completed);

-- ✅ Index for mistakes
CREATE INDEX IF NOT EXISTS idx_mistakes_user_trade 
ON mistakes(user_id, trade_id, is_resolved);

-- ✅ Partial index for active goals (faster queries)
CREATE INDEX IF NOT EXISTS idx_goals_active 
ON goals(user_id, created_at DESC) 
WHERE completed = false;

-- ✅ Partial index for unacknowledged mistakes
CREATE INDEX IF NOT EXISTS idx_mistakes_unresolved 
ON mistakes(user_id, detected_at DESC) 
WHERE is_resolved = false;

-- ✅ Index for trades by profile (if using profiles)
CREATE INDEX IF NOT EXISTS idx_trades_profile_date 
ON trades(profile_id, trade_date DESC) 
WHERE deleted_at IS NULL AND profile_id IS NOT NULL;

-- ✅ Composite index for calendar queries
-- Note: Using expression index for DATE() function
CREATE INDEX IF NOT EXISTS idx_trades_calendar 
ON trades(user_id, (DATE(trade_date)), pnl) 
WHERE deleted_at IS NULL;

-- ✅ Index for strategy analysis
CREATE INDEX IF NOT EXISTS idx_trades_strategy 
ON trades(user_id, strategy, trade_date DESC) 
WHERE deleted_at IS NULL AND strategy IS NOT NULL;

-- ✅ Analyze tables for query optimization
ANALYZE trades;
ANALYZE audio_journal_entries;
ANALYZE goals;
ANALYZE mistakes;
ANALYZE profiles;

-- ✅ Create RPC function for daily P&L aggregation (faster than client-side)
CREATE OR REPLACE FUNCTION get_daily_pnl(
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

-- ✅ Create RPC function for dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
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

-- ✅ Grant execute permissions
GRANT EXECUTE ON FUNCTION get_daily_pnl(UUID, DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_metrics(UUID, UUID, INTEGER) TO authenticated;
