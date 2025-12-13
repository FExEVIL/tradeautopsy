-- ============================================
-- Multi-Broker Support Tables
-- ============================================

-- Brokers table
CREATE TABLE IF NOT EXISTS brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Zerodha", "Upstox", "Angel One", etc.
  broker_type TEXT NOT NULL, -- 'zerodha', 'upstox', 'angel_one', 'custom'
  api_key TEXT, -- Will be encrypted in application layer
  api_secret TEXT, -- Will be encrypted in application layer
  access_token TEXT, -- Will be encrypted in application layer
  refresh_token TEXT, -- Will be encrypted in application layer
  token_expires_at TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error'
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}', -- Broker-specific config
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brokers_user 
  ON brokers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brokers_status 
  ON brokers(user_id, connection_status);

-- Broker-Profile Association
CREATE TABLE IF NOT EXISTS broker_profiles (
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (broker_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_broker_profiles_broker 
  ON broker_profiles(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_profiles_profile 
  ON broker_profiles(profile_id);

-- Add broker_id to trades
ALTER TABLE trades 
  ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_trades_broker 
  ON trades(user_id, broker_id, trade_date DESC) 
  WHERE deleted_at IS NULL;

-- Row Level Security for brokers
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own brokers" ON brokers;
CREATE POLICY "Users can view own brokers" ON brokers 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own brokers" ON brokers;
CREATE POLICY "Users can insert own brokers" ON brokers 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own brokers" ON brokers;
CREATE POLICY "Users can update own brokers" ON brokers 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own brokers" ON brokers;
CREATE POLICY "Users can delete own brokers" ON brokers 
  FOR DELETE USING (auth.uid() = user_id);

-- Row Level Security for broker_profiles
ALTER TABLE broker_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own broker profiles" ON broker_profiles;
CREATE POLICY "Users can view own broker profiles" ON broker_profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brokers 
      WHERE brokers.id = broker_profiles.broker_id 
      AND brokers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own broker profiles" ON broker_profiles;
CREATE POLICY "Users can insert own broker profiles" ON broker_profiles 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM brokers 
      WHERE brokers.id = broker_profiles.broker_id 
      AND brokers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own broker profiles" ON broker_profiles;
CREATE POLICY "Users can delete own broker profiles" ON broker_profiles 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM brokers 
      WHERE brokers.id = broker_profiles.broker_id 
      AND brokers.user_id = auth.uid()
    )
  );
