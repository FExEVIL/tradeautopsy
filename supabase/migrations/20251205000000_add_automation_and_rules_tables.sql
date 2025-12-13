-- ============================================
-- Automation Preferences & Trading Rules Tables
-- ============================================

-- Automation preferences table
CREATE TABLE IF NOT EXISTS automation_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_tag_enabled BOOLEAN DEFAULT true,
  auto_categorize_enabled BOOLEAN DEFAULT true,
  auto_pattern_detection BOOLEAN DEFAULT true,
  auto_report_schedule TEXT DEFAULT 'off', -- 'off', 'daily', 'weekly', 'monthly'
  smart_suggestions_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading rules table
CREATE TABLE IF NOT EXISTS trading_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL, -- 'time_restriction', 'trade_limit', 'loss_limit', 'behavioral', 'strategy'
  title TEXT NOT NULL,
  description TEXT,
  rule_config JSONB NOT NULL, -- { max_trades: 3, after_hour: 14, max_loss: 5000, etc. }
  enabled BOOLEAN DEFAULT true,
  severity TEXT DEFAULT 'warning', -- 'warning', 'blocking'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist (in case table was created without them in a previous migration)
DO $$ 
BEGIN
  -- Add enabled column if it doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trading_rules') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trading_rules' AND column_name = 'enabled') THEN
      ALTER TABLE trading_rules ADD COLUMN enabled BOOLEAN DEFAULT true;
    END IF;
    
    -- Add other columns if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trading_rules' AND column_name = 'severity') THEN
      ALTER TABLE trading_rules ADD COLUMN severity TEXT DEFAULT 'warning';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trading_rules' AND column_name = 'updated_at') THEN
      ALTER TABLE trading_rules ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Create indexes after table is created (using DO block for safety)
DO $$ 
BEGIN
  -- Check if table exists and has the enabled column
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public' 
    AND t.table_name = 'trading_rules'
    AND c.column_name = 'enabled'
  ) THEN
    -- Create user index if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_trading_rules_user') THEN
      CREATE INDEX idx_trading_rules_user ON trading_rules(user_id, created_at DESC);
    END IF;
    
    -- Create enabled index if it doesn't exist (partial index)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_trading_rules_enabled') THEN
      CREATE INDEX idx_trading_rules_enabled ON trading_rules(user_id, enabled) WHERE enabled = true;
    END IF;
  END IF;
END $$;

-- Rule violations table
CREATE TABLE IF NOT EXISTS rule_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES trading_rules(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  violation_time TIMESTAMPTZ DEFAULT NOW(),
  user_overrode BOOLEAN DEFAULT false,
  violation_details JSONB -- Additional context about the violation
);

-- Create indexes for rule_violations
DO $$ 
BEGIN
  -- Check if table exists first (with schema check)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rule_violations') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_rule_violations_user') THEN
      CREATE INDEX idx_rule_violations_user ON rule_violations(user_id, violation_time DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_rule_violations_rule') THEN
      CREATE INDEX idx_rule_violations_rule ON rule_violations(rule_id);
    END IF;
  END IF;
END $$;

-- Rule adherence stats table
CREATE TABLE IF NOT EXISTS rule_adherence_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0, -- Days without violations
  longest_streak INT DEFAULT 0,
  total_violations INT DEFAULT 0,
  total_trades INT DEFAULT 0,
  adherence_score NUMERIC(5,2) DEFAULT 100, -- 0-100
  badges JSONB DEFAULT '[]', -- Earned badges
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE automation_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_adherence_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_preferences
DROP POLICY IF EXISTS "Users can view own automation preferences" ON automation_preferences;
CREATE POLICY "Users can view own automation preferences" ON automation_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own automation preferences" ON automation_preferences;
CREATE POLICY "Users can insert own automation preferences" ON automation_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own automation preferences" ON automation_preferences;
CREATE POLICY "Users can update own automation preferences" ON automation_preferences FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for trading_rules
DROP POLICY IF EXISTS "Users can view own rules" ON trading_rules;
CREATE POLICY "Users can view own rules" ON trading_rules FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own rules" ON trading_rules;
CREATE POLICY "Users can insert own rules" ON trading_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own rules" ON trading_rules;
CREATE POLICY "Users can update own rules" ON trading_rules FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own rules" ON trading_rules;
CREATE POLICY "Users can delete own rules" ON trading_rules FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for rule_violations
DROP POLICY IF EXISTS "Users can view own violations" ON rule_violations;
CREATE POLICY "Users can view own violations" ON rule_violations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own violations" ON rule_violations;
CREATE POLICY "Users can insert own violations" ON rule_violations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for rule_adherence_stats
DROP POLICY IF EXISTS "Users can view own adherence stats" ON rule_adherence_stats;
CREATE POLICY "Users can view own adherence stats" ON rule_adherence_stats FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own adherence stats" ON rule_adherence_stats;
CREATE POLICY "Users can insert own adherence stats" ON rule_adherence_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own adherence stats" ON rule_adherence_stats;
CREATE POLICY "Users can update own adherence stats" ON rule_adherence_stats FOR UPDATE USING (auth.uid() = user_id);

