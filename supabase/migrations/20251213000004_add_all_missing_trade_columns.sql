-- ============================================
-- Add ALL Missing Columns to Trades Table
-- ============================================
-- This migration adds all columns required by the CSV import route
-- Run this to fix "Could not find column" errors

-- Core trade columns
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS price DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS symbol VARCHAR(255),
ADD COLUMN IF NOT EXISTS trade_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS instrument_type VARCHAR(20) DEFAULT 'EQUITY',
ADD COLUMN IF NOT EXISTS segment VARCHAR(20) DEFAULT 'NSE',
ADD COLUMN IF NOT EXISTS lot_size INTEGER DEFAULT 1;

-- P&L related columns (if not already added)
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS pnl DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS pnl_percentage DECIMAL(8, 2),
ADD COLUMN IF NOT EXISTS charges DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS entry_price DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS exit_price DECIMAL(12, 2);

-- Ensure tradingsymbol exists (should already exist, but just in case)
-- Note: If tradingsymbol doesn't exist, you may need to check your base schema
-- This assumes tradingsymbol already exists

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_trades_price ON trades(user_id, price) WHERE price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_trades_trade_type ON trades(user_id, trade_type);
CREATE INDEX IF NOT EXISTS idx_trades_instrument_type ON trades(user_id, instrument_type);
CREATE INDEX IF NOT EXISTS idx_trades_segment ON trades(user_id, segment);

-- Update existing rows to have defaults where needed
UPDATE trades 
SET instrument_type = 'EQUITY' 
WHERE instrument_type IS NULL;

UPDATE trades 
SET segment = 'NSE' 
WHERE segment IS NULL;

UPDATE trades 
SET lot_size = 1 
WHERE lot_size IS NULL;

-- If price is NULL but average_price exists, copy it
UPDATE trades 
SET price = average_price 
WHERE price IS NULL AND average_price IS NOT NULL;

-- If symbol is NULL but tradingsymbol exists, copy it
UPDATE trades 
SET symbol = tradingsymbol 
WHERE symbol IS NULL AND tradingsymbol IS NOT NULL;

-- If trade_type is NULL but transaction_type exists, copy it
UPDATE trades 
SET trade_type = transaction_type 
WHERE trade_type IS NULL AND transaction_type IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN trades.price IS 'Trade price (can be same as average_price)';
COMMENT ON COLUMN trades.symbol IS 'Trading symbol (can be same as tradingsymbol)';
COMMENT ON COLUMN trades.trade_type IS 'Trade type: BUY or SELL (can be same as transaction_type)';
COMMENT ON COLUMN trades.instrument_type IS 'Type of instrument: EQUITY, FO (Futures & Options), OPTIONS';
COMMENT ON COLUMN trades.segment IS 'Market segment: NSE, BSE, etc.';
COMMENT ON COLUMN trades.lot_size IS 'Lot size for F&O trades (default: 1 for equity)';

