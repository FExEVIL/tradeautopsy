-- ============================================
-- Performance Optimization Indexes
-- Improves query performance and reduces TTFB
-- ============================================

-- Trades table indexes for faster dashboard queries
CREATE INDEX IF NOT EXISTS idx_trades_user_entry_time 
ON trades(user_id, trade_date DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_trades_user_status 
ON trades(user_id, status) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_trades_pnl 
ON trades(pnl) 
WHERE pnl IS NOT NULL AND deleted_at IS NULL;

-- Composite index for dashboard queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_trades_dashboard 
ON trades(user_id, trade_date DESC, pnl) 
WHERE deleted_at IS NULL;

-- Profile-specific index
CREATE INDEX IF NOT EXISTS idx_trades_profile_date 
ON trades(profile_id, trade_date DESC) 
WHERE profile_id IS NOT NULL AND deleted_at IS NULL;

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_trades_date_range 
ON trades(trade_date) 
WHERE deleted_at IS NULL;

-- Index for symbol lookups
CREATE INDEX IF NOT EXISTS idx_trades_symbol 
ON trades(user_id, symbol) 
WHERE symbol IS NOT NULL AND deleted_at IS NULL;

-- Goals table indexes
CREATE INDEX IF NOT EXISTS idx_goals_user_created 
ON goals(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_goals_user_completed 
ON goals(user_id, completed) 
WHERE completed = false;

CREATE INDEX IF NOT EXISTS idx_goals_profile 
ON goals(profile_id) 
WHERE profile_id IS NOT NULL;

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_user_date 
ON journal_entries(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_journal_trade 
ON journal_entries(trade_id) 
WHERE trade_id IS NOT NULL;

-- Audio journal entries indexes
CREATE INDEX IF NOT EXISTS idx_audio_journal_user_date 
ON audio_journal_entries(user_id, created_at DESC);

-- Patterns and insights indexes
CREATE INDEX IF NOT EXISTS idx_patterns_user_detected 
ON detected_patterns(user_id, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_insights_user_created 
ON ai_insights(user_id, created_at DESC);

-- Analyze tables to update query planner statistics
ANALYZE trades;
ANALYZE goals;
ANALYZE journal_entries;
ANALYZE audio_journal_entries;
ANALYZE detected_patterns;
ANALYZE ai_insights;

-- ============================================
-- Performance Notes:
-- 1. Indexes are created with WHERE clauses to reduce index size
-- 2. DESC NULLS LAST ensures most recent trades are at the top
-- 3. Composite indexes match common query patterns
-- 4. Partial indexes (with WHERE) are smaller and faster
-- ============================================

