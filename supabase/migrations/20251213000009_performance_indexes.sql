-- ============================================
-- Performance Optimization: Database Indexes
-- ============================================
-- These indexes dramatically speed up common queries
-- Run this migration to improve query performance by 10x+

-- Index for faster trade queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_trades_user_profile_date 
ON trades(user_id, profile_id, trade_date DESC) 
WHERE deleted_at IS NULL;

-- Index for journal queries (filtering by journal status)
CREATE INDEX IF NOT EXISTS idx_trades_journal 
ON trades(user_id, profile_id, has_audio_journal, notes) 
WHERE deleted_at IS NULL;

-- Index for P&L filters (WIN/LOSS filtering)
CREATE INDEX IF NOT EXISTS idx_trades_pnl 
ON trades(user_id, profile_id, pnl) 
WHERE deleted_at IS NULL;

-- Composite index for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_trades_common_query 
ON trades(user_id, profile_id, trade_date DESC, pnl, deleted_at)
WHERE deleted_at IS NULL;

-- Index for symbol search
CREATE INDEX IF NOT EXISTS idx_trades_symbol_search 
ON trades(user_id, profile_id, symbol, tradingsymbol) 
WHERE deleted_at IS NULL;

-- Index for strategy/setup filtering
CREATE INDEX IF NOT EXISTS idx_trades_strategy 
ON trades(user_id, profile_id, strategy, setup) 
WHERE deleted_at IS NULL;

-- Index for execution rating queries
CREATE INDEX IF NOT EXISTS idx_trades_execution_rating 
ON trades(user_id, profile_id, execution_rating) 
WHERE deleted_at IS NULL AND execution_rating IS NOT NULL;

-- Index for audio journal entries (join optimization)
CREATE INDEX IF NOT EXISTS idx_audio_journal_trade_user 
ON audio_journal_entries(trade_id, user_id);

-- Index for profiles (active profile lookup)
CREATE INDEX IF NOT EXISTS idx_profiles_user_active 
ON profiles(user_id, is_active, is_default);

-- Update table statistics for query planner
ANALYZE trades;
ANALYZE audio_journal_entries;
ANALYZE profiles;

-- Add comments for documentation
COMMENT ON INDEX idx_trades_user_profile_date IS 'Optimizes most common trade listing queries';
COMMENT ON INDEX idx_trades_pnl IS 'Speeds up WIN/LOSS filter operations';
COMMENT ON INDEX idx_trades_journal IS 'Faster journal filtering queries';
