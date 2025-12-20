-- ============================================
-- ENTERPRISE PERFORMANCE OPTIMIZATION
-- Complete Database Migration
-- Date: 2025-01-02
-- ============================================
-- This migration adds comprehensive indexes, views, functions, and RLS policies
-- All operations are conditional - will skip if tables/columns don't exist

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For text search
CREATE EXTENSION IF NOT EXISTS btree_gin; -- For composite indexes

-- ============================================
-- HELPER FUNCTION: Check if column exists
-- ============================================
CREATE OR REPLACE FUNCTION column_exists(
  p_table_name TEXT,
  p_column_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name
    AND column_name = p_column_name
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DROP EXISTING FUNCTIONS AND VIEWS
-- ============================================
-- Drop existing functions if they exist (to handle return type changes)
DROP FUNCTION IF EXISTS get_trades_paginated(UUID, UUID, INTEGER, INTEGER, DATE, DATE, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_dashboard_metrics(UUID, UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_performance_by_symbol(UUID, UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_daily_pnl(UUID, UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS refresh_all_views() CASCADE;

-- Drop existing views (both regular and materialized) if they exist
-- Check view type first, then drop accordingly
DO $$
BEGIN
  -- Drop v_dashboard_summary
  IF EXISTS (
    SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'v_dashboard_summary'
  ) THEN
    DROP MATERIALIZED VIEW v_dashboard_summary CASCADE;
  ELSIF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'v_dashboard_summary'
  ) THEN
    DROP VIEW v_dashboard_summary CASCADE;
  END IF;
  
  -- Drop v_recent_trades
  IF EXISTS (
    SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'v_recent_trades'
  ) THEN
    DROP MATERIALIZED VIEW v_recent_trades CASCADE;
  ELSIF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'v_recent_trades'
  ) THEN
    DROP VIEW v_recent_trades CASCADE;
  END IF;
  
  -- Drop v_active_insights
  IF EXISTS (
    SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'v_active_insights'
  ) THEN
    DROP MATERIALIZED VIEW v_active_insights CASCADE;
  ELSIF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'v_active_insights'
  ) THEN
    DROP VIEW v_active_insights CASCADE;
  END IF;
END $$;

-- ============================================
-- SECTION 1: INDEXES FOR TRADES TABLE
-- ============================================

-- Primary lookup patterns
CREATE INDEX IF NOT EXISTS idx_trades_user_id 
ON trades(user_id);

DO $$
BEGIN
  IF column_exists('trades', 'profile_id') THEN
    CREATE INDEX IF NOT EXISTS idx_trades_profile_id 
    ON trades(profile_id);
    
    CREATE INDEX IF NOT EXISTS idx_trades_user_profile 
    ON trades(user_id, profile_id);
  END IF;
END $$;

-- Date-based queries (most common filter)
DO $$
DECLARE
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_deleted_at THEN
    CREATE INDEX IF NOT EXISTS idx_trades_trade_date_desc_optimized 
    ON trades(trade_date DESC NULLS LAST) 
    WHERE deleted_at IS NULL;
  ELSE
    CREATE INDEX IF NOT EXISTS idx_trades_trade_date_desc_optimized 
    ON trades(trade_date DESC NULLS LAST);
  END IF;
END $$;

-- Entry time index (only if column exists)
DO $$
DECLARE
  v_has_entry_time BOOLEAN;
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_entry_time := column_exists('trades', 'entry_time');
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_entry_time THEN
    IF v_has_deleted_at THEN
      CREATE INDEX IF NOT EXISTS idx_trades_entry_time_desc_optimized 
      ON trades(entry_time DESC NULLS LAST) 
      WHERE entry_time IS NOT NULL AND deleted_at IS NULL;
    ELSE
      CREATE INDEX IF NOT EXISTS idx_trades_entry_time_desc_optimized 
      ON trades(entry_time DESC NULLS LAST) 
      WHERE entry_time IS NOT NULL;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_deleted_at THEN
    CREATE INDEX IF NOT EXISTS idx_trades_created_at_desc_optimized 
    ON trades(created_at DESC NULLS LAST) 
    WHERE deleted_at IS NULL;
  ELSE
    CREATE INDEX IF NOT EXISTS idx_trades_created_at_desc_optimized 
    ON trades(created_at DESC NULLS LAST);
  END IF;
END $$;

-- Symbol lookups
DO $$
DECLARE
  v_has_symbol BOOLEAN;
  v_has_tradingsymbol BOOLEAN;
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_symbol := column_exists('trades', 'symbol');
  v_has_tradingsymbol := column_exists('trades', 'tradingsymbol');
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_symbol THEN
    IF v_has_deleted_at THEN
      CREATE INDEX IF NOT EXISTS idx_trades_symbol_optimized 
      ON trades(user_id, symbol) 
      WHERE symbol IS NOT NULL AND deleted_at IS NULL;
    ELSE
      CREATE INDEX IF NOT EXISTS idx_trades_symbol_optimized 
      ON trades(user_id, symbol) 
      WHERE symbol IS NOT NULL;
    END IF;
  END IF;
  
  IF v_has_tradingsymbol THEN
    IF v_has_deleted_at THEN
      CREATE INDEX IF NOT EXISTS idx_trades_tradingsymbol_optimized 
      ON trades(user_id, tradingsymbol) 
      WHERE tradingsymbol IS NOT NULL AND deleted_at IS NULL;
    ELSE
      CREATE INDEX IF NOT EXISTS idx_trades_tradingsymbol_optimized 
      ON trades(user_id, tradingsymbol) 
      WHERE tradingsymbol IS NOT NULL;
    END IF;
  END IF;
END $$;

-- P&L queries
DO $$
DECLARE
  v_has_pnl BOOLEAN;
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_pnl := column_exists('trades', 'pnl');
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_pnl THEN
    IF v_has_deleted_at THEN
      CREATE INDEX IF NOT EXISTS idx_trades_pnl_desc_optimized 
      ON trades(pnl DESC NULLS LAST) 
      WHERE pnl IS NOT NULL AND deleted_at IS NULL;
      
      CREATE INDEX IF NOT EXISTS idx_trades_pnl_user_optimized 
      ON trades(user_id, pnl DESC NULLS LAST) 
      WHERE deleted_at IS NULL;
    ELSE
      CREATE INDEX IF NOT EXISTS idx_trades_pnl_desc_optimized 
      ON trades(pnl DESC NULLS LAST) 
      WHERE pnl IS NOT NULL;
      
      CREATE INDEX IF NOT EXISTS idx_trades_pnl_user_optimized 
      ON trades(user_id, pnl DESC NULLS LAST);
    END IF;
  END IF;
END $$;

-- Strategy queries
DO $$
DECLARE
  v_has_strategy BOOLEAN;
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_strategy := column_exists('trades', 'strategy');
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_strategy THEN
    IF v_has_deleted_at THEN
      CREATE INDEX IF NOT EXISTS idx_trades_strategy_optimized 
      ON trades(user_id, strategy) 
      WHERE strategy IS NOT NULL AND deleted_at IS NULL;
    ELSE
      CREATE INDEX IF NOT EXISTS idx_trades_strategy_optimized 
      ON trades(user_id, strategy) 
      WHERE strategy IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Partial indexes for common filters
DO $$
DECLARE
  v_has_deleted_at BOOLEAN;
  v_has_pnl BOOLEAN;
  v_has_entry_time BOOLEAN;
  v_has_exit_time BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  v_has_pnl := column_exists('trades', 'pnl');
  v_has_entry_time := column_exists('trades', 'entry_time');
  v_has_exit_time := column_exists('trades', 'exit_time');
  
  IF v_has_pnl THEN
    IF v_has_deleted_at THEN
      CREATE INDEX IF NOT EXISTS idx_trades_profitable_optimized 
      ON trades(user_id, trade_date DESC) 
      WHERE pnl > 0 AND deleted_at IS NULL;
      
      CREATE INDEX IF NOT EXISTS idx_trades_losing_optimized 
      ON trades(user_id, trade_date DESC) 
      WHERE pnl < 0 AND deleted_at IS NULL;
    ELSE
      CREATE INDEX IF NOT EXISTS idx_trades_profitable_optimized 
      ON trades(user_id, trade_date DESC) 
      WHERE pnl > 0;
      
      CREATE INDEX IF NOT EXISTS idx_trades_losing_optimized 
      ON trades(user_id, trade_date DESC) 
      WHERE pnl < 0;
    END IF;
  END IF;
  
  IF v_has_entry_time AND v_has_exit_time THEN
    IF v_has_deleted_at THEN
      CREATE INDEX IF NOT EXISTS idx_trades_open_optimized 
      ON trades(user_id, entry_time DESC) 
      WHERE exit_time IS NULL AND deleted_at IS NULL;
    ELSE
      CREATE INDEX IF NOT EXISTS idx_trades_open_optimized 
      ON trades(user_id, entry_time DESC) 
      WHERE exit_time IS NULL;
    END IF;
  END IF;
END $$;

-- Covering index for list view (includes commonly selected columns)
DO $$
DECLARE
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_deleted_at THEN
    CREATE INDEX IF NOT EXISTS idx_trades_list_covering_optimized 
    ON trades(user_id, trade_date DESC) 
    INCLUDE (id, symbol, tradingsymbol, side, pnl, entry_price, exit_price, quantity, strategy, status)
    WHERE deleted_at IS NULL;
  ELSE
    CREATE INDEX IF NOT EXISTS idx_trades_list_covering_optimized 
    ON trades(user_id, trade_date DESC) 
    INCLUDE (id, symbol, tradingsymbol, side, pnl, entry_price, exit_price, quantity, strategy, status);
  END IF;
END $$;

-- Tags index (GIN for array searches)
DO $$
BEGIN
  IF column_exists('trades', 'tags') THEN
    IF column_exists('trades', 'deleted_at') THEN
      CREATE INDEX IF NOT EXISTS idx_trades_tags_gin_optimized 
      ON trades USING GIN(tags) 
      WHERE tags IS NOT NULL AND deleted_at IS NULL;
    ELSE
      CREATE INDEX IF NOT EXISTS idx_trades_tags_gin_optimized 
      ON trades USING GIN(tags) 
      WHERE tags IS NOT NULL;
    END IF;
  END IF;
END $$;

-- ============================================
-- SECTION 2: INDEXES FOR TAI_INSIGHTS TABLE
-- ============================================
-- Only create indexes if tai_insights table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tai_insights'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_tai_insights_user_optimized 
    ON tai_insights(user_id) 
    WHERE dismissed = false;

    CREATE INDEX IF NOT EXISTS idx_tai_insights_profile_optimized 
    ON tai_insights(profile_id) 
    WHERE profile_id IS NOT NULL AND dismissed = false;

    CREATE INDEX IF NOT EXISTS idx_tai_insights_type_optimized 
    ON tai_insights(user_id, type) 
    WHERE dismissed = false;

    CREATE INDEX IF NOT EXISTS idx_tai_insights_severity_optimized 
    ON tai_insights(user_id, severity DESC) 
    WHERE dismissed = false;

    CREATE INDEX IF NOT EXISTS idx_tai_insights_created_desc_optimized 
    ON tai_insights(created_at DESC NULLS LAST) 
    WHERE dismissed = false;

    CREATE INDEX IF NOT EXISTS idx_tai_insights_active_optimized 
    ON tai_insights(user_id, created_at DESC) 
    WHERE dismissed = false AND expires_at > NOW();
  END IF;
END $$;

-- ============================================
-- SECTION 3: INDEXES FOR PROFILES TABLE
-- ============================================

DO $$
DECLARE
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('profiles', 'deleted_at');
  
  IF v_has_deleted_at THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_user_optimized 
    ON profiles(user_id) 
    WHERE deleted_at IS NULL;

    CREATE INDEX IF NOT EXISTS idx_profiles_active_optimized 
    ON profiles(user_id, is_default DESC) 
    WHERE deleted_at IS NULL;
  ELSE
    CREATE INDEX IF NOT EXISTS idx_profiles_user_optimized 
    ON profiles(user_id);

    CREATE INDEX IF NOT EXISTS idx_profiles_active_optimized 
    ON profiles(user_id, is_default DESC);
  END IF;
END $$;

-- ============================================
-- SECTION 4: INDEXES FOR GOALS TABLE
-- ============================================

DO $$
DECLARE
  v_has_deleted_at BOOLEAN;
  v_has_profile_id BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('goals', 'deleted_at');
  v_has_profile_id := column_exists('goals', 'profile_id');
  
  IF v_has_deleted_at THEN
    CREATE INDEX IF NOT EXISTS idx_goals_user_optimized 
    ON goals(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
    IF v_has_profile_id THEN
      CREATE INDEX IF NOT EXISTS idx_goals_user_profile_optimized 
      ON goals(user_id, profile_id, created_at DESC) 
      WHERE profile_id IS NOT NULL AND deleted_at IS NULL;
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_goals_active_optimized 
    ON goals(user_id, completed) 
    WHERE completed = false AND deleted_at IS NULL;
  ELSE
    CREATE INDEX IF NOT EXISTS idx_goals_user_optimized 
    ON goals(user_id, created_at DESC);
    
    IF v_has_profile_id THEN
      CREATE INDEX IF NOT EXISTS idx_goals_user_profile_optimized 
      ON goals(user_id, profile_id, created_at DESC) 
      WHERE profile_id IS NOT NULL;
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_goals_active_optimized 
    ON goals(user_id, completed) 
    WHERE completed = false;
  END IF;
END $$;

-- ============================================
-- SECTION 5: INDEXES FOR JOURNAL ENTRIES
-- ============================================

DO $$
DECLARE
  v_has_deleted_at BOOLEAN;
  v_has_trade_id BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('journal_entries', 'deleted_at');
  v_has_trade_id := column_exists('journal_entries', 'trade_id');
  
  IF v_has_deleted_at THEN
    CREATE INDEX IF NOT EXISTS idx_journal_user_date_optimized 
    ON journal_entries(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
    IF v_has_trade_id THEN
      CREATE INDEX IF NOT EXISTS idx_journal_trade_optimized 
      ON journal_entries(trade_id) 
      WHERE trade_id IS NOT NULL AND deleted_at IS NULL;
    END IF;
  ELSE
    CREATE INDEX IF NOT EXISTS idx_journal_user_date_optimized 
    ON journal_entries(user_id, created_at DESC);
    
    IF v_has_trade_id THEN
      CREATE INDEX IF NOT EXISTS idx_journal_trade_optimized 
      ON journal_entries(trade_id) 
      WHERE trade_id IS NOT NULL;
    END IF;
  END IF;
END $$;

-- ============================================
-- SECTION 6: INDEXES FOR AUDIO JOURNAL ENTRIES
-- ============================================

DO $$
DECLARE
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('audio_journal_entries', 'deleted_at');
  
  IF v_has_deleted_at THEN
    CREATE INDEX IF NOT EXISTS idx_audio_journal_user_date_optimized 
    ON audio_journal_entries(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
  ELSE
    CREATE INDEX IF NOT EXISTS idx_audio_journal_user_date_optimized 
    ON audio_journal_entries(user_id, created_at DESC);
  END IF;
END $$;

-- ============================================
-- SECTION 7: INDEXES FOR DETECTED PATTERNS
-- ============================================

DO $$
DECLARE
  v_has_acknowledged BOOLEAN;
BEGIN
  v_has_acknowledged := column_exists('detected_patterns', 'acknowledged');
  
  IF v_has_acknowledged THEN
    CREATE INDEX IF NOT EXISTS idx_patterns_user_detected_optimized 
    ON detected_patterns(user_id, detected_at DESC) 
    WHERE acknowledged = false;

    CREATE INDEX IF NOT EXISTS idx_patterns_type_optimized 
    ON detected_patterns(user_id, pattern_type) 
    WHERE acknowledged = false;
  ELSE
    CREATE INDEX IF NOT EXISTS idx_patterns_user_detected_optimized 
    ON detected_patterns(user_id, detected_at DESC);

    CREATE INDEX IF NOT EXISTS idx_patterns_type_optimized 
    ON detected_patterns(user_id, pattern_type);
  END IF;
END $$;

-- ============================================
-- SECTION 8: DATABASE FUNCTIONS
-- ============================================
-- Note: Functions are dropped at the top of the migration (see DROP EXISTING FUNCTIONS section)

-- Function: Get paginated trades with total count
CREATE OR REPLACE FUNCTION get_trades_paginated(
  p_user_id UUID,
  p_profile_id UUID DEFAULT NULL,
  p_page INTEGER DEFAULT 0,
  p_page_size INTEGER DEFAULT 20,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_symbol TEXT DEFAULT NULL,
  p_strategy TEXT DEFAULT NULL
)
RETURNS TABLE (
  trades JSONB,
  total_count BIGINT,
  total_pages INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INTEGER;
  v_total_count BIGINT;
  v_total_pages INTEGER;
  v_trades JSONB;
  v_has_deleted_at BOOLEAN;
BEGIN
  v_offset := p_page * p_page_size;
  v_has_deleted_at := column_exists('trades', 'deleted_at');

  -- Get total count
  IF v_has_deleted_at THEN
    SELECT COUNT(*) INTO v_total_count
    FROM trades
    WHERE user_id = p_user_id
      AND deleted_at IS NULL
      AND (p_profile_id IS NULL OR profile_id = p_profile_id)
      AND (p_start_date IS NULL OR trade_date >= p_start_date)
      AND (p_end_date IS NULL OR trade_date <= p_end_date)
      AND (p_symbol IS NULL OR symbol ILIKE '%' || p_symbol || '%' OR tradingsymbol ILIKE '%' || p_symbol || '%')
      AND (p_strategy IS NULL OR strategy = p_strategy);
  ELSE
    SELECT COUNT(*) INTO v_total_count
    FROM trades
    WHERE user_id = p_user_id
      AND (p_profile_id IS NULL OR profile_id = p_profile_id)
      AND (p_start_date IS NULL OR trade_date >= p_start_date)
      AND (p_end_date IS NULL OR trade_date <= p_end_date)
      AND (p_symbol IS NULL OR symbol ILIKE '%' || p_symbol || '%' OR tradingsymbol ILIKE '%' || p_symbol || '%')
      AND (p_strategy IS NULL OR strategy = p_strategy);
  END IF;

  v_total_pages := CEIL(v_total_count::NUMERIC / p_page_size);

  -- Get paginated trades
  IF v_has_deleted_at THEN
    SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb) INTO v_trades
    FROM (
      SELECT *
      FROM trades
      WHERE user_id = p_user_id
        AND deleted_at IS NULL
        AND (p_profile_id IS NULL OR profile_id = p_profile_id)
        AND (p_start_date IS NULL OR trade_date >= p_start_date)
        AND (p_end_date IS NULL OR trade_date <= p_end_date)
        AND (p_symbol IS NULL OR symbol ILIKE '%' || p_symbol || '%' OR tradingsymbol ILIKE '%' || p_symbol || '%')
        AND (p_strategy IS NULL OR strategy = p_strategy)
      ORDER BY trade_date DESC, created_at DESC
      LIMIT p_page_size
      OFFSET v_offset
    ) t;
  ELSE
    SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb) INTO v_trades
    FROM (
      SELECT *
      FROM trades
      WHERE user_id = p_user_id
        AND (p_profile_id IS NULL OR profile_id = p_profile_id)
        AND (p_start_date IS NULL OR trade_date >= p_start_date)
        AND (p_end_date IS NULL OR trade_date <= p_end_date)
        AND (p_symbol IS NULL OR symbol ILIKE '%' || p_symbol || '%' OR tradingsymbol ILIKE '%' || p_symbol || '%')
        AND (p_strategy IS NULL OR strategy = p_strategy)
      ORDER BY trade_date DESC, created_at DESC
      LIMIT p_page_size
      OFFSET v_offset
    ) t;
  END IF;

  RETURN QUERY SELECT v_trades, v_total_count, v_total_pages;
END;
$$;

-- Function: Get dashboard metrics in single query
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
  p_user_id UUID,
  p_profile_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_metrics JSONB;
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_deleted_at THEN
    SELECT jsonb_build_object(
      'total_trades', COUNT(*),
      'total_pnl', COALESCE(SUM(pnl), 0),
      'winning_trades', COUNT(*) FILTER (WHERE pnl > 0),
      'losing_trades', COUNT(*) FILTER (WHERE pnl < 0),
      'win_rate', CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE pnl > 0)::NUMERIC / COUNT(*)::NUMERIC * 100)
        ELSE 0 
      END,
      'avg_win', COALESCE(AVG(pnl) FILTER (WHERE pnl > 0), 0),
      'avg_loss', COALESCE(AVG(pnl) FILTER (WHERE pnl < 0), 0),
      'largest_win', COALESCE(MAX(pnl) FILTER (WHERE pnl > 0), 0),
      'largest_loss', COALESCE(MIN(pnl) FILTER (WHERE pnl < 0), 0)
    ) INTO v_metrics
    FROM trades
    WHERE user_id = p_user_id
      AND deleted_at IS NULL
      AND (p_profile_id IS NULL OR profile_id = p_profile_id)
      AND (p_start_date IS NULL OR trade_date >= p_start_date)
      AND (p_end_date IS NULL OR trade_date <= p_end_date);
  ELSE
    SELECT jsonb_build_object(
      'total_trades', COUNT(*),
      'total_pnl', COALESCE(SUM(pnl), 0),
      'winning_trades', COUNT(*) FILTER (WHERE pnl > 0),
      'losing_trades', COUNT(*) FILTER (WHERE pnl < 0),
      'win_rate', CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE pnl > 0)::NUMERIC / COUNT(*)::NUMERIC * 100)
        ELSE 0 
      END,
      'avg_win', COALESCE(AVG(pnl) FILTER (WHERE pnl > 0), 0),
      'avg_loss', COALESCE(AVG(pnl) FILTER (WHERE pnl < 0), 0),
      'largest_win', COALESCE(MAX(pnl) FILTER (WHERE pnl > 0), 0),
      'largest_loss', COALESCE(MIN(pnl) FILTER (WHERE pnl < 0), 0)
    ) INTO v_metrics
    FROM trades
    WHERE user_id = p_user_id
      AND (p_profile_id IS NULL OR profile_id = p_profile_id)
      AND (p_start_date IS NULL OR trade_date >= p_start_date)
      AND (p_end_date IS NULL OR trade_date <= p_end_date);
  END IF;
  
  RETURN v_metrics;
END;
$$;

-- Function: Get performance by symbol
CREATE OR REPLACE FUNCTION get_performance_by_symbol(
  p_user_id UUID,
  p_profile_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  symbol TEXT,
  total_trades BIGINT,
  total_pnl NUMERIC,
  win_rate NUMERIC,
  avg_pnl NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_deleted_at THEN
    RETURN QUERY
    SELECT 
      COALESCE(t.symbol, t.tradingsymbol, 'Unknown')::TEXT as symbol,
      COUNT(*)::BIGINT as total_trades,
      COALESCE(SUM(t.pnl), 0)::NUMERIC as total_pnl,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE t.pnl > 0)::NUMERIC / COUNT(*)::NUMERIC * 100)
        ELSE 0 
      END::NUMERIC as win_rate,
      COALESCE(AVG(t.pnl), 0)::NUMERIC as avg_pnl
    FROM trades t
    WHERE t.user_id = p_user_id
      AND t.deleted_at IS NULL
      AND (p_profile_id IS NULL OR t.profile_id = p_profile_id)
      AND (p_start_date IS NULL OR t.trade_date >= p_start_date)
      AND (p_end_date IS NULL OR t.trade_date <= p_end_date)
    GROUP BY COALESCE(t.symbol, t.tradingsymbol, 'Unknown')
    ORDER BY total_pnl DESC;
  ELSE
    RETURN QUERY
    SELECT 
      COALESCE(t.symbol, t.tradingsymbol, 'Unknown')::TEXT as symbol,
      COUNT(*)::BIGINT as total_trades,
      COALESCE(SUM(t.pnl), 0)::NUMERIC as total_pnl,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE t.pnl > 0)::NUMERIC / COUNT(*)::NUMERIC * 100)
        ELSE 0 
      END::NUMERIC as win_rate,
      COALESCE(AVG(t.pnl), 0)::NUMERIC as avg_pnl
    FROM trades t
    WHERE t.user_id = p_user_id
      AND (p_profile_id IS NULL OR t.profile_id = p_profile_id)
      AND (p_start_date IS NULL OR t.trade_date >= p_start_date)
      AND (p_end_date IS NULL OR t.trade_date <= p_end_date)
    GROUP BY COALESCE(t.symbol, t.tradingsymbol, 'Unknown')
    ORDER BY total_pnl DESC;
  END IF;
END;
$$;

-- Function: Get daily P&L for charts
CREATE OR REPLACE FUNCTION get_daily_pnl(
  p_user_id UUID,
  p_profile_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  total_pnl NUMERIC,
  trade_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_deleted_at THEN
    RETURN QUERY
    SELECT 
      t.trade_date as date,
      COALESCE(SUM(t.pnl), 0)::NUMERIC as total_pnl,
      COUNT(*)::BIGINT as trade_count
    FROM trades t
    WHERE t.user_id = p_user_id
      AND t.deleted_at IS NULL
      AND (p_profile_id IS NULL OR t.profile_id = p_profile_id)
      AND (p_start_date IS NULL OR t.trade_date >= p_start_date)
      AND (p_end_date IS NULL OR t.trade_date <= p_end_date)
    GROUP BY t.trade_date
    ORDER BY t.trade_date DESC;
  ELSE
    RETURN QUERY
    SELECT 
      t.trade_date as date,
      COALESCE(SUM(t.pnl), 0)::NUMERIC as total_pnl,
      COUNT(*)::BIGINT as trade_count
    FROM trades t
    WHERE t.user_id = p_user_id
      AND (p_profile_id IS NULL OR t.profile_id = p_profile_id)
      AND (p_start_date IS NULL OR t.trade_date >= p_start_date)
      AND (p_end_date IS NULL OR t.trade_date <= p_end_date)
    GROUP BY t.trade_date
    ORDER BY t.trade_date DESC;
  END IF;
END;
$$;

-- ============================================
-- SECTION 9: MATERIALIZED VIEWS
-- ============================================

-- View: Dashboard summary (pre-aggregated metrics)
DO $$
DECLARE
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_deleted_at THEN
    CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_summary AS
    SELECT 
      user_id,
      profile_id,
      COUNT(*) as total_trades,
      COALESCE(SUM(pnl), 0) as total_pnl,
      COUNT(*) FILTER (WHERE pnl > 0) as winning_trades,
      COUNT(*) FILTER (WHERE pnl < 0) as losing_trades,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE pnl > 0)::NUMERIC / COUNT(*)::NUMERIC * 100)
        ELSE 0 
      END as win_rate
    FROM trades
    WHERE deleted_at IS NULL
    GROUP BY user_id, profile_id;
  ELSE
    CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_summary AS
    SELECT 
      user_id,
      profile_id,
      COUNT(*) as total_trades,
      COALESCE(SUM(pnl), 0) as total_pnl,
      COUNT(*) FILTER (WHERE pnl > 0) as winning_trades,
      COUNT(*) FILTER (WHERE pnl < 0) as losing_trades,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE pnl > 0)::NUMERIC / COUNT(*)::NUMERIC * 100)
        ELSE 0 
      END as win_rate
    FROM trades
    GROUP BY user_id, profile_id;
  END IF;
END $$;

-- Regular index for v_dashboard_summary (unique index created in SECTION 10)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'v_dashboard_summary'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_v_dashboard_summary_user 
    ON v_dashboard_summary(user_id, profile_id);
  END IF;
END $$;

-- View: Recent trades (last 30 days)
DO $$
DECLARE
  v_has_deleted_at BOOLEAN;
BEGIN
  v_has_deleted_at := column_exists('trades', 'deleted_at');
  
  IF v_has_deleted_at THEN
    CREATE MATERIALIZED VIEW IF NOT EXISTS v_recent_trades AS
    SELECT *
    FROM trades
    WHERE trade_date >= CURRENT_DATE - INTERVAL '30 days'
      AND deleted_at IS NULL;
  ELSE
    CREATE MATERIALIZED VIEW IF NOT EXISTS v_recent_trades AS
    SELECT *
    FROM trades
    WHERE trade_date >= CURRENT_DATE - INTERVAL '30 days';
  END IF;
END $$;

-- Regular index for v_recent_trades (unique index created in SECTION 10)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'v_recent_trades'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_v_recent_trades_user_date 
    ON v_recent_trades(user_id, trade_date DESC);
  END IF;
END $$;

DO $$
BEGIN
  IF column_exists('v_recent_trades', 'profile_id') THEN
    CREATE INDEX IF NOT EXISTS idx_v_recent_trades_profile 
    ON v_recent_trades(profile_id) 
    WHERE profile_id IS NOT NULL;
  END IF;
END $$;

-- View: Active insights (non-dismissed, non-expired)
-- Only create if tai_insights table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tai_insights'
  ) THEN
    CREATE MATERIALIZED VIEW IF NOT EXISTS v_active_insights AS
    SELECT *
    FROM tai_insights
    WHERE dismissed = false
      AND (expires_at IS NULL OR expires_at > NOW());
  END IF;
END $$;

-- Indexes for v_active_insights (only if materialized view exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'v_active_insights'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_v_active_insights_user 
    ON v_active_insights(user_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_v_active_insights_severity 
    ON v_active_insights(user_id, severity DESC);
  END IF;
END $$;

-- ============================================
-- SECTION 10: UNIQUE INDEXES FOR MATERIALIZED VIEWS
-- ============================================
-- Required for CONCURRENTLY refresh

-- Unique index for v_dashboard_summary
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'v_dashboard_summary'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'v_dashboard_summary' 
      AND indexname = 'v_dashboard_summary_unique_idx'
    ) THEN
      CREATE UNIQUE INDEX v_dashboard_summary_unique_idx 
      ON v_dashboard_summary(user_id, COALESCE(profile_id, '00000000-0000-0000-0000-000000000000'::uuid));
    END IF;
  END IF;
END $$;

-- Unique index for v_recent_trades
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'v_recent_trades'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'v_recent_trades' 
      AND indexname = 'v_recent_trades_unique_idx'
    ) THEN
      CREATE UNIQUE INDEX v_recent_trades_unique_idx 
      ON v_recent_trades(id);
    END IF;
  END IF;
END $$;

-- Unique index for v_active_insights
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'v_active_insights'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'v_active_insights' 
      AND indexname = 'v_active_insights_unique_idx'
    ) THEN
      CREATE UNIQUE INDEX v_active_insights_unique_idx 
      ON v_active_insights(id);
    END IF;
  END IF;
END $$;

-- ============================================
-- SECTION 11: REFRESH VIEWS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION refresh_all_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh v_dashboard_summary if it exists
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'v_dashboard_summary'
  ) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_dashboard_summary;
  END IF;

  -- Refresh v_recent_trades if it exists
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'v_recent_trades'
  ) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_recent_trades;
  END IF;

  -- Refresh v_active_insights if it exists
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'v_active_insights'
  ) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_active_insights;
  END IF;
  
  RAISE NOTICE 'All materialized views refreshed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error refreshing views: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION refresh_all_views() TO authenticated;

COMMENT ON FUNCTION refresh_all_views() IS 'Refreshes all materialized views concurrently. Safe to call even if views don''t exist.';

-- ============================================
-- SECTION 11: ROW LEVEL SECURITY POLICIES
-- ============================================

-- Ensure RLS is enabled on all tables
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
-- Only enable RLS on tai_insights if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tai_insights'
  ) THEN
    ALTER TABLE tai_insights ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'journal_entries'
  ) THEN
    ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'audio_journal_entries'
  ) THEN
    ALTER TABLE audio_journal_entries ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'detected_patterns'
  ) THEN
    ALTER TABLE detected_patterns ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Trades policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'trades' 
    AND policyname = 'users_select_own_trades_optimized'
  ) THEN
    CREATE POLICY users_select_own_trades_optimized ON trades
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- TAI Insights policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tai_insights'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'tai_insights' 
      AND policyname = 'users_select_own_insights_optimized'
    ) THEN
      CREATE POLICY users_select_own_insights_optimized ON tai_insights
        FOR SELECT
        USING (auth.uid() = user_id AND dismissed = false);
    END IF;
  END IF;
END $$;

-- Profiles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'users_select_own_profiles_optimized'
  ) THEN
    CREATE POLICY users_select_own_profiles_optimized ON profiles
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Goals policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'goals' 
    AND policyname = 'users_select_own_goals_optimized'
  ) THEN
    CREATE POLICY users_select_own_goals_optimized ON goals
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- SECTION 12: ANALYZE TABLES
-- ============================================

-- Update query planner statistics for optimal query plans
ANALYZE trades;
-- Only analyze tai_insights if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tai_insights'
  ) THEN
    ANALYZE tai_insights;
  END IF;
END $$;
ANALYZE profiles;
ANALYZE goals;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'journal_entries'
  ) THEN
    ANALYZE journal_entries;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'audio_journal_entries'
  ) THEN
    ANALYZE audio_journal_entries;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'detected_patterns'
  ) THEN
    ANALYZE detected_patterns;
  END IF;
END $$;

-- ============================================
-- SECTION 14: STATISTICS TARGETS
-- ============================================

-- Increase statistics targets for frequently filtered columns
ALTER TABLE trades ALTER COLUMN user_id SET STATISTICS 1000;
ALTER TABLE trades ALTER COLUMN profile_id SET STATISTICS 1000;
ALTER TABLE trades ALTER COLUMN trade_date SET STATISTICS 1000;
DO $$
BEGIN
  IF column_exists('trades', 'symbol') THEN
    ALTER TABLE trades ALTER COLUMN symbol SET STATISTICS 500;
  END IF;
  IF column_exists('trades', 'pnl') THEN
    ALTER TABLE trades ALTER COLUMN pnl SET STATISTICS 500;
  END IF;
END $$;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Enterprise performance optimization migration completed successfully!';
END $$;
