-- ============================================
-- Add instrument_type column to trades table
-- ============================================
-- This column is required for P&L calculation and trade categorization

ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS instrument_type VARCHAR(20) DEFAULT 'EQUITY';

-- Add index for instrument type queries
CREATE INDEX IF NOT EXISTS idx_trades_instrument_type ON trades(user_id, instrument_type);

-- Add comment for documentation
COMMENT ON COLUMN trades.instrument_type IS 'Type of instrument: EQUITY, FO (Futures & Options), OPTIONS';

-- Update existing trades to have a default instrument_type if NULL
UPDATE trades 
SET instrument_type = 'EQUITY' 
WHERE instrument_type IS NULL;
