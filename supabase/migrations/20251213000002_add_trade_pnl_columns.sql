-- ============================================
-- Add P&L and Trade Columns
-- ============================================
-- Add columns for P&L calculation and trade details

ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS pnl DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS charges DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS entry_price DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS exit_price DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS lot_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS segment VARCHAR(20) DEFAULT 'NSE';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trades_pnl ON trades(user_id, pnl) WHERE pnl IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trades_entry_exit ON trades(user_id, entry_price, exit_price) WHERE entry_price IS NOT NULL AND exit_price IS NOT NULL;
