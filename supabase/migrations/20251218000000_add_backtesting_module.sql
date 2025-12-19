-- ═══════════════════════════════════════════════════════════════════
-- BACKTESTING MODULE - DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════

-- 1. Strategy Templates Table
CREATE TABLE IF NOT EXISTS strategy_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'bullish', 'bearish', 'neutral', 'volatile'
  risk_type VARCHAR(50), -- 'defined', 'undefined'
  min_legs INTEGER DEFAULT 1,
  max_legs INTEGER DEFAULT 4,
  typical_structure JSONB, -- Store leg configuration
  example_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trade Legs Table (for multi-leg strategies)
CREATE TABLE IF NOT EXISTS trade_legs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  leg_number INTEGER NOT NULL,
  instrument_type VARCHAR(20), -- 'call', 'put', 'stock', 'future'
  action VARCHAR(10), -- 'buy', 'sell'
  strike_price DECIMAL(10,2),
  expiry_date DATE,
  quantity INTEGER NOT NULL,
  entry_price DECIMAL(10,2),
  exit_price DECIMAL(10,2),
  entry_time TIMESTAMPTZ,
  exit_time TIMESTAMPTZ,
  premium DECIMAL(10,2),
  
  -- Greeks at entry
  delta_entry DECIMAL(8,4),
  gamma_entry DECIMAL(8,4),
  theta_entry DECIMAL(8,4),
  vega_entry DECIMAL(8,4),
  
  -- Greeks at exit
  delta_exit DECIMAL(8,4),
  gamma_exit DECIMAL(8,4),
  theta_exit DECIMAL(8,4),
  vega_exit DECIMAL(8,4),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trade_legs_trade_id ON trade_legs(trade_id);

-- 3. Backtest Configurations Table
CREATE TABLE IF NOT EXISTS backtest_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  
  -- Strategy details
  strategy_template_id UUID REFERENCES strategy_templates(id),
  strategy_name VARCHAR(100),
  legs_config JSONB, -- Store leg configuration
  
  -- Backtest parameters
  symbol VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  initial_capital DECIMAL(12,2) NOT NULL,
  
  -- Entry rules
  entry_days_to_expiry INTEGER,
  entry_strike_selection VARCHAR(20), -- 'ATM', 'OTM', 'ITM'
  entry_delta_target DECIMAL(5,2),
  entry_time VARCHAR(20), -- '09:30', '10:00', etc.
  
  -- Exit rules
  exit_target_profit_pct DECIMAL(5,2),
  exit_stop_loss_pct DECIMAL(5,2),
  exit_days_to_expiry INTEGER,
  exit_time VARCHAR(20),
  trailing_stop_pct DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backtest_configs_user ON backtest_configs(user_id);

-- 4. Backtest Results Table
CREATE TABLE IF NOT EXISTS backtest_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id UUID REFERENCES backtest_configs(id) ON DELETE CASCADE,
  
  -- Summary metrics
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  
  -- P&L metrics
  total_pnl DECIMAL(12,2) DEFAULT 0,
  avg_win DECIMAL(10,2) DEFAULT 0,
  avg_loss DECIMAL(10,2) DEFAULT 0,
  largest_win DECIMAL(10,2) DEFAULT 0,
  largest_loss DECIMAL(10,2) DEFAULT 0,
  
  -- Risk metrics
  max_drawdown DECIMAL(10,2) DEFAULT 0,
  max_drawdown_pct DECIMAL(5,2) DEFAULT 0,
  profit_factor DECIMAL(8,2) DEFAULT 0,
  sharpe_ratio DECIMAL(8,4) DEFAULT 0,
  
  -- Additional metrics
  avg_trade_duration_days DECIMAL(5,1),
  total_commissions DECIMAL(10,2) DEFAULT 0,
  final_capital DECIMAL(12,2),
  return_pct DECIMAL(8,2),
  
  -- Detailed data
  equity_curve JSONB, -- [{date, equity}, ...]
  trade_details JSONB, -- [{entry, exit, pnl}, ...]
  monthly_returns JSONB, -- {month: return}
  
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_backtest_results_user ON backtest_results(user_id);
CREATE INDEX idx_backtest_results_config ON backtest_results(config_id);
CREATE INDEX idx_backtest_results_status ON backtest_results(status);

-- 5. Option Chain Historical Data (for backtesting)
CREATE TABLE IF NOT EXISTS option_chain_historical (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  strike_price DECIMAL(10,2) NOT NULL,
  option_type VARCHAR(10) NOT NULL, -- 'call', 'put'
  
  -- Price data
  open DECIMAL(10,2),
  high DECIMAL(10,2),
  low DECIMAL(10,2),
  close DECIMAL(10,2),
  ltp DECIMAL(10,2),
  
  -- Volume & OI
  volume BIGINT,
  open_interest BIGINT,
  oi_change BIGINT,
  
  -- Greeks
  delta DECIMAL(8,4),
  gamma DECIMAL(8,4),
  theta DECIMAL(8,4),
  vega DECIMAL(8,4),
  
  -- Volatility
  implied_volatility DECIMAL(6,2),
  
  -- Spot price at time
  spot_price DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_option_chain_symbol_date ON option_chain_historical(symbol, date);
CREATE INDEX idx_option_chain_expiry ON option_chain_historical(expiry_date);
CREATE INDEX idx_option_chain_strike ON option_chain_historical(strike_price);

-- 6. Strategy Performance Analytics
CREATE TABLE IF NOT EXISTS strategy_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_name VARCHAR(100) NOT NULL,
  
  -- Aggregated metrics
  total_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  avg_pnl DECIMAL(10,2) DEFAULT 0,
  total_pnl DECIMAL(12,2) DEFAULT 0,
  best_trade DECIMAL(10,2) DEFAULT 0,
  worst_trade DECIMAL(10,2) DEFAULT 0,
  
  -- Time period
  period_start DATE,
  period_end DATE,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_strategy_performance_user ON strategy_performance(user_id);

-- 7. Add strategy fields to existing trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS strategy_type VARCHAR(100);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS strategy_category VARCHAR(50);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS is_multi_leg BOOLEAN DEFAULT false;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS total_legs INTEGER DEFAULT 1;

-- 8. RLS Policies
ALTER TABLE strategy_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_chain_historical ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_performance ENABLE ROW LEVEL SECURITY;

-- Allow public read for templates
CREATE POLICY "Anyone can view strategy templates"
ON strategy_templates FOR SELECT TO authenticated, anon USING (true);

-- Users can manage their own data
CREATE POLICY "Users can manage their trade legs"
ON trade_legs FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM trades 
    WHERE trades.id = trade_legs.trade_id 
    AND trades.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their backtest configs"
ON backtest_configs FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view their backtest results"
ON backtest_results FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view option chain data"
ON option_chain_historical FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can manage their strategy performance"
ON strategy_performance FOR ALL TO authenticated
USING (user_id = auth.uid());

-- 9. Insert default strategy templates
INSERT INTO strategy_templates (name, description, category, risk_type, min_legs, max_legs, typical_structure) VALUES
('Long Call', 'Bullish strategy with unlimited profit potential', 'bullish', 'undefined', 1, 1, 
  '{"legs": [{"type": "call", "action": "buy", "strikes": "ATM or slightly OTM"}]}'::jsonb),
  
('Long Put', 'Bearish strategy with high profit potential', 'bearish', 'undefined', 1, 1,
  '{"legs": [{"type": "put", "action": "buy", "strikes": "ATM or slightly OTM"}]}'::jsonb),
  
('Bull Call Spread', 'Limited risk bullish strategy', 'bullish', 'defined', 2, 2,
  '{"legs": [{"type": "call", "action": "buy", "strikes": "ATM"}, {"type": "call", "action": "sell", "strikes": "OTM"}]}'::jsonb),
  
('Bear Put Spread', 'Limited risk bearish strategy', 'bearish', 'defined', 2, 2,
  '{"legs": [{"type": "put", "action": "buy", "strikes": "ATM"}, {"type": "put", "action": "sell", "strikes": "OTM"}]}'::jsonb),
  
('Iron Condor', 'Neutral strategy for range-bound markets', 'neutral', 'defined', 4, 4,
  '{"legs": [{"type": "call", "action": "buy", "strikes": "Far OTM"}, {"type": "call", "action": "sell", "strikes": "OTM"}, {"type": "put", "action": "sell", "strikes": "OTM"}, {"type": "put", "action": "buy", "strikes": "Far OTM"}]}'::jsonb),
  
('Iron Butterfly', 'Neutral strategy for sideways markets', 'neutral', 'defined', 4, 4,
  '{"legs": [{"type": "call", "action": "buy", "strikes": "OTM"}, {"type": "call", "action": "sell", "strikes": "ATM"}, {"type": "put", "action": "sell", "strikes": "ATM"}, {"type": "put", "action": "buy", "strikes": "OTM"}]}'::jsonb),
  
('Long Straddle', 'High volatility strategy', 'volatile', 'undefined', 2, 2,
  '{"legs": [{"type": "call", "action": "buy", "strikes": "ATM"}, {"type": "put", "action": "buy", "strikes": "ATM"}]}'::jsonb),
  
('Short Straddle', 'Low volatility strategy with high risk', 'neutral', 'undefined', 2, 2,
  '{"legs": [{"type": "call", "action": "sell", "strikes": "ATM"}, {"type": "put", "action": "sell", "strikes": "ATM"}]}'::jsonb),
  
('Long Strangle', 'Volatile market strategy', 'volatile', 'undefined', 2, 2,
  '{"legs": [{"type": "call", "action": "buy", "strikes": "OTM"}, {"type": "put", "action": "buy", "strikes": "OTM"}]}'::jsonb),
  
('Short Strangle', 'Neutral strategy for stable markets', 'neutral', 'undefined', 2, 2,
  '{"legs": [{"type": "call", "action": "sell", "strikes": "OTM"}, {"type": "put", "action": "sell", "strikes": "OTM"}]}'::jsonb);

-- ✅ Database schema complete
