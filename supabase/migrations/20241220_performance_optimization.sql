-- ============================================
-- TRADEAUTOPSY PERFORMANCE OPTIMIZATION
-- Complete Database Migration
-- Date: 2024-12-20
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For text search
CREATE EXTENSION IF NOT EXISTS btree_gin; -- For composite indexes

-- ============================================
-- SECTION 1: INDEXES FOR TRADES TABLE
-- ============================================

-- Primary lookup patterns
CREATE INDEX IF NOT EXISTS idx_trades_user_id 
ON trades(user_id);

CREATE INDEX IF NOT EXISTS idx_trades_profile_id 
ON trades(profile_id);

CREATE INDEX IF NOT EXISTS idx_trades_user_profile 
ON trades(user_id, profile_id);

-- Date-based queries (most common filter)
-- Only create indexes if columns exist
DO $$
BEGIN
  -- Entry date index (if column exists)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'trades' AND column_name = 'entry_date') THEN
    CREATE INDEX IF NOT EXISTS idx_trades_entry_date ON trades(entry_date DESC);
  END IF;

  -- Exit date index (if column exists)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'trades' AND column_name = 'exit_date') THEN
    CREATE INDEX IF NOT EXISTS idx_trades_exit_date ON trades(exit_date DESC);
  END IF;
END $$;

-- Trade date index (always exists)
CREATE INDEX IF NOT EXISTS idx_trades_trade_date 
ON trades(trade_date DESC);

-- Created at index (always exists)
CREATE INDEX IF NOT EXISTS idx_trades_created_at 
ON trades(created_at DESC);

-- Composite index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_trades_user_date 
ON trades(user_id, profile_id, trade_date DESC);

-- Symbol-based filtering (only if symbol column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'trades' AND column_name = 'symbol') THEN
    CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
    CREATE INDEX IF NOT EXISTS idx_trades_user_symbol ON trades(user_id, profile_id, symbol);
  END IF;
END $$;

-- P&L queries (frequently filtered/sorted)
CREATE INDEX IF NOT EXISTS idx_trades_pnl 
ON trades(pnl DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_trades_profitable 
ON trades(user_id, profile_id, pnl) 
WHERE pnl > 0;

CREATE INDEX IF NOT EXISTS idx_trades_losing 
ON trades(user_id, profile_id, pnl) 
WHERE pnl < 0;

-- Strategy and setup filtering
CREATE INDEX IF NOT EXISTS idx_trades_strategy 
ON trades(strategy) 
WHERE strategy IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_trades_setup 
ON trades(setup) 
WHERE setup IS NOT NULL;

-- Side filtering (long/short)
CREATE INDEX IF NOT EXISTS idx_trades_side 
ON trades(side);

-- Trade type (BUY/SELL) - only if column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'trades' AND column_name = 'trade_type') THEN
    CREATE INDEX IF NOT EXISTS idx_trades_trade_type ON trades(trade_type);
  END IF;
END $$;

-- Partial index for open trades (only if exit_date column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'trades' AND column_name = 'exit_date') THEN
    CREATE INDEX IF NOT EXISTS idx_trades_open 
    ON trades(user_id, profile_id, entry_date DESC)
    WHERE exit_date IS NULL;
  END IF;
END $$;

-- Covering index for list view (avoids table lookups)
-- Only include columns that exist
DO $$
BEGIN
  -- Check which columns exist and build index accordingly
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'trades' AND column_name = 'symbol') THEN
    CREATE INDEX IF NOT EXISTS idx_trades_list_view 
    ON trades(user_id, profile_id, trade_date DESC)
    INCLUDE (symbol, side, pnl, entry_price, exit_price, quantity);
  ELSE
    -- Fallback if symbol doesn't exist, use tradingsymbol
    CREATE INDEX IF NOT EXISTS idx_trades_list_view 
    ON trades(user_id, profile_id, trade_date DESC)
    INCLUDE (tradingsymbol, side, pnl, entry_price, exit_price, quantity);
  END IF;
END $$;

-- ============================================
-- SECTION 2: OPTIMIZED VIEWS FOR COMMON QUERIES
-- ============================================

-- Dashboard summary view (cached at DB level)
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT 
    user_id,
    profile_id,
    COUNT(*) as total_trades,
    COUNT(*) FILTER (WHERE pnl > 0) as winning_trades,
    COUNT(*) FILTER (WHERE pnl < 0) as losing_trades,
    COALESCE(SUM(pnl), 0) as total_pnl,
    COALESCE(AVG(pnl), 0) as avg_pnl,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((COUNT(*) FILTER (WHERE pnl > 0)::numeric / COUNT(*)::numeric) * 100, 2)
        ELSE 0 
    END as win_rate,
    MIN(trade_date) as first_trade_date,
    MAX(trade_date) as last_trade_date
FROM trades
WHERE pnl IS NOT NULL AND deleted_at IS NULL
GROUP BY user_id, profile_id;

-- Recent trades view (last 30 days)
CREATE OR REPLACE VIEW v_recent_trades AS
SELECT *
FROM trades
WHERE trade_date >= CURRENT_DATE - INTERVAL '30 days'
  AND deleted_at IS NULL
ORDER BY trade_date DESC, created_at DESC;

-- ============================================
-- SECTION 3: OPTIMIZED FUNCTIONS
-- ============================================

-- Function to get paginated trades with total count
CREATE OR REPLACE FUNCTION get_trades_paginated(
    p_user_id UUID,
    p_profile_id UUID,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL,
    p_symbol TEXT DEFAULT NULL,
    p_side TEXT DEFAULT NULL,
    p_strategy TEXT DEFAULT NULL
)
RETURNS TABLE (
    trades JSONB,
    total_count BIGINT,
    page_count INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total BIGINT;
    v_trades JSONB;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO v_total
    FROM trades t
    WHERE t.user_id = p_user_id
      AND t.profile_id = p_profile_id
      AND t.deleted_at IS NULL
      AND (p_date_from IS NULL OR t.trade_date >= p_date_from)
      AND (p_date_to IS NULL OR t.trade_date <= p_date_to)
      AND (p_symbol IS NULL OR t.symbol = p_symbol)
      AND (p_side IS NULL OR t.side = p_side)
      AND (p_strategy IS NULL OR t.strategy = p_strategy);
    
    -- Get paginated trades
    SELECT COALESCE(jsonb_agg(row_to_json(t.*) ORDER BY t.trade_date DESC, t.created_at DESC), '[]'::jsonb)
    INTO v_trades
    FROM (
        SELECT *
        FROM trades t
        WHERE t.user_id = p_user_id
          AND t.profile_id = p_profile_id
          AND t.deleted_at IS NULL
          AND (p_date_from IS NULL OR t.trade_date >= p_date_from)
          AND (p_date_to IS NULL OR t.trade_date <= p_date_to)
          AND (p_symbol IS NULL OR t.symbol = p_symbol)
          AND (p_side IS NULL OR t.side = p_side)
          AND (p_strategy IS NULL OR t.strategy = p_strategy)
        ORDER BY t.trade_date DESC, t.created_at DESC
        LIMIT p_limit
        OFFSET p_offset
    ) t;
    
    RETURN QUERY SELECT 
        v_trades,
        v_total,
        CASE WHEN p_limit > 0 THEN CEIL(v_total::numeric / p_limit::numeric)::INT ELSE 0 END;
END;
$$;

-- Function to get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
    p_user_id UUID,
    p_profile_id UUID,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
)
RETURNS TABLE (
    total_trades BIGINT,
    winning_trades BIGINT,
    losing_trades BIGINT,
    total_pnl NUMERIC,
    avg_pnl NUMERIC,
    win_rate NUMERIC,
    max_profit NUMERIC,
    max_loss NUMERIC,
    avg_winner NUMERIC,
    avg_loser NUMERIC,
    profit_factor NUMERIC,
    expectancy NUMERIC,
    total_volume NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH trade_stats AS (
        SELECT 
            COUNT(*) as total_trades,
            COUNT(*) FILTER (WHERE pnl > 0) as winning_trades,
            COUNT(*) FILTER (WHERE pnl < 0) as losing_trades,
            COALESCE(SUM(pnl), 0) as total_pnl,
            COALESCE(AVG(pnl), 0) as avg_pnl,
            COALESCE(MAX(pnl), 0) as max_profit,
            COALESCE(MIN(pnl), 0) as max_loss,
            COALESCE(AVG(pnl) FILTER (WHERE pnl > 0), 0) as avg_winner,
            COALESCE(AVG(pnl) FILTER (WHERE pnl < 0), 0) as avg_loser,
            COALESCE(SUM(pnl) FILTER (WHERE pnl > 0), 0) as total_winners,
            ABS(COALESCE(SUM(pnl) FILTER (WHERE pnl < 0), 0)) as total_losers,
            COALESCE(SUM(quantity * COALESCE(entry_price, 0)), 0) as total_volume
        FROM trades
        WHERE user_id = p_user_id
          AND profile_id = p_profile_id
          AND deleted_at IS NULL
          AND (p_date_from IS NULL OR trade_date >= p_date_from)
          AND (p_date_to IS NULL OR trade_date <= p_date_to)
          AND pnl IS NOT NULL
    )
    SELECT 
        ts.total_trades,
        ts.winning_trades,
        ts.losing_trades,
        ts.total_pnl,
        ts.avg_pnl,
        CASE 
            WHEN ts.total_trades > 0 
            THEN ROUND((ts.winning_trades::numeric / ts.total_trades::numeric) * 100, 2)
            ELSE 0 
        END as win_rate,
        ts.max_profit,
        ts.max_loss,
        ts.avg_winner,
        ts.avg_loser,
        CASE 
            WHEN ts.total_losers > 0 
            THEN ROUND(ts.total_winners / ts.total_losers, 2)
            ELSE ts.total_winners
        END as profit_factor,
        CASE 
            WHEN ts.total_trades > 0 
            THEN ROUND(ts.total_pnl / ts.total_trades, 2)
            ELSE 0 
        END as expectancy,
        ts.total_volume
    FROM trade_stats ts;
END;
$$;

-- Function to get daily P&L data for charts
CREATE OR REPLACE FUNCTION get_daily_pnl(
    p_user_id UUID,
    p_profile_id UUID,
    p_days INT DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    pnl NUMERIC,
    cumulative_pnl NUMERIC,
    trade_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH daily AS (
        SELECT 
            t.trade_date as date,
            COALESCE(SUM(t.pnl), 0) as pnl,
            COUNT(*) as trade_count
        FROM trades t
        WHERE t.user_id = p_user_id
          AND t.profile_id = p_profile_id
          AND t.deleted_at IS NULL
          AND t.trade_date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
          AND t.pnl IS NOT NULL
        GROUP BY t.trade_date
        ORDER BY t.trade_date
    )
    SELECT 
        d.date,
        d.pnl,
        SUM(d.pnl) OVER (ORDER BY d.date) as cumulative_pnl,
        d.trade_count
    FROM daily d;
END;
$$;

-- ============================================
-- SECTION 4: STATISTICS TARGETS
-- ============================================

-- Increase statistics target for frequently filtered columns
ALTER TABLE trades ALTER COLUMN symbol SET STATISTICS 1000;
ALTER TABLE trades ALTER COLUMN strategy SET STATISTICS 500;
ALTER TABLE trades ALTER COLUMN trade_date SET STATISTICS 1000;
ALTER TABLE trades ALTER COLUMN pnl SET STATISTICS 500;

-- ============================================
-- SECTION 5: VACUUM AND ANALYZE
-- ============================================

-- Analyze tables for query planner optimization
ANALYZE trades;
ANALYZE profiles;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
