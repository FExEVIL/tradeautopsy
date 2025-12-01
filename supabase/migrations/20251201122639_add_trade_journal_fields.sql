-- Add journal fields to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE trades ADD COLUMN IF NOT EXISTS emotion VARCHAR(50);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS setup_type VARCHAR(50);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_tags ON trades USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_trades_emotion ON trades(emotion);
CREATE INDEX IF NOT EXISTS idx_trades_setup_type ON trades(setup_type);
CREATE INDEX IF NOT EXISTS idx_trades_rating ON trades(rating);

-- Add comments for documentation
COMMENT ON COLUMN trades.notes IS 'Trader journal notes for this trade';
COMMENT ON COLUMN trades.tags IS 'Behavioral tags like Revenge, FOMO, FollowedPlan';
COMMENT ON COLUMN trades.emotion IS 'Emotional state during trade: Revenge, Fear, Calm, Greedy, Disciplined';
COMMENT ON COLUMN trades.rating IS 'Trade execution quality rating (1-5 stars)';
COMMENT ON COLUMN trades.setup_type IS 'Trade setup: Breakout, Pullback, Reversal, Range';
