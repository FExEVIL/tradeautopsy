-- Add execution_rating column to trades table
-- This allows users to rate their trade execution quality (0-5 stars)

ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS execution_rating INTEGER CHECK (execution_rating >= 0 AND execution_rating <= 5);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_trades_execution_rating ON trades(user_id, execution_rating) WHERE execution_rating IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN trades.execution_rating IS 'User rating of trade execution quality (0-5 stars)';
