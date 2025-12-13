-- Add P&L calculation columns to trades table
-- This migration adds columns for storing calculated P&L values

-- Add P&L column if not exists
ALTER TABLE trades ADD COLUMN IF NOT EXISTS pnl DECIMAL(12, 2);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS pnl_percentage DECIMAL(8, 2);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS charges DECIMAL(10, 2) DEFAULT 0;

-- Add index for P&L queries
CREATE INDEX IF NOT EXISTS idx_trades_pnl ON trades(user_id, pnl) WHERE pnl IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trades_pnl_percentage ON trades(user_id, pnl_percentage) WHERE pnl_percentage IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN trades.pnl IS 'Calculated profit/loss for the trade (in INR)';
COMMENT ON COLUMN trades.pnl_percentage IS 'P&L as percentage of investment';
COMMENT ON COLUMN trades.charges IS 'Total charges (brokerage, STT, taxes) for the trade';

-- Note: pnl column already exists in some schemas, but we ensure it's there
-- The pnl column was part of the original schema, but we're adding pnl_percentage and charges
