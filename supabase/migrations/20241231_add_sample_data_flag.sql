-- Add is_sample flag to trades and goals tables for demo/sample data
-- This allows users to try TradeAutopsy with sample data and easily clear it

-- Add is_sample column to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;

-- Add is_sample column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;

-- Create index for efficient querying of sample data
CREATE INDEX IF NOT EXISTS idx_trades_is_sample ON trades(user_id, profile_id, is_sample) WHERE is_sample = true;
CREATE INDEX IF NOT EXISTS idx_goals_is_sample ON goals(user_id, profile_id, is_sample) WHERE is_sample = true;

-- Add comments for documentation
COMMENT ON COLUMN trades.is_sample IS 'Flag indicating if this trade is sample/demo data';
COMMENT ON COLUMN goals.is_sample IS 'Flag indicating if this goal is sample/demo data';

