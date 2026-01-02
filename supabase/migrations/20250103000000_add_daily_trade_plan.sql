-- ============================================
-- Daily Trade Plan Tables
-- ============================================

-- Daily trade plans table
CREATE TABLE IF NOT EXISTS daily_trade_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  plan_date DATE NOT NULL,
  
  -- Market Overview
  market_sentiment TEXT, -- 'bullish', 'bearish', 'neutral', 'volatile'
  key_events TEXT[], -- Array of important events/news
  market_notes TEXT,
  
  -- Key Levels
  support_levels NUMERIC(10,2)[],
  resistance_levels NUMERIC(10,2)[],
  key_symbols TEXT[], -- Symbols to watch
  
  -- Trading Plan
  trading_plan TEXT, -- Detailed plan for the day
  risk_parameters JSONB DEFAULT '{}', -- {"max_loss": 1000, "max_trades": 5, "position_size": 10000}
  focus_areas TEXT[], -- ["discipline", "risk_management", "patience"]
  
  -- EOD Review
  eod_review TEXT, -- End of day review notes
  plan_execution_score INTEGER CHECK (plan_execution_score >= 1 AND plan_execution_score <= 5),
  lessons_learned TEXT,
  tomorrow_focus TEXT,
  
  -- Status
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date 
  ON daily_trade_plans(user_id, plan_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_plans_profile_date 
  ON daily_trade_plans(profile_id, plan_date DESC) WHERE profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_plans_completed 
  ON daily_trade_plans(user_id, completed, plan_date DESC) WHERE completed = false;

-- Unique constraint: one plan per user per day per profile
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_plans_unique 
  ON daily_trade_plans(user_id, profile_id, plan_date);

-- Row Level Security
ALTER TABLE daily_trade_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own daily plans" ON daily_trade_plans;
CREATE POLICY "Users can view own daily plans" ON daily_trade_plans 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own daily plans" ON daily_trade_plans;
CREATE POLICY "Users can insert own daily plans" ON daily_trade_plans 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily plans" ON daily_trade_plans;
CREATE POLICY "Users can update own daily plans" ON daily_trade_plans 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own daily plans" ON daily_trade_plans;
CREATE POLICY "Users can delete own daily plans" ON daily_trade_plans 
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_plan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_daily_plan_updated_at ON daily_trade_plans;
CREATE TRIGGER trigger_update_daily_plan_updated_at
  BEFORE UPDATE ON daily_trade_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_plan_updated_at();

