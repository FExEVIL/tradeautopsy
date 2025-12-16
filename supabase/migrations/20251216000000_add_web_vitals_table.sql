-- ✅ Table to store Web Vitals metrics for custom analytics
CREATE TABLE IF NOT EXISTS web_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name VARCHAR(10) NOT NULL,
  metric_value DECIMAL(10, 2) NOT NULL,
  metric_rating VARCHAR(20),
  metric_id VARCHAR(100),
  navigation_type VARCHAR(50),
  page_url TEXT,
  user_agent TEXT,
  ip_address VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vitals_metric ON web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_vitals_timestamp ON web_vitals(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_rating ON web_vitals(metric_rating);
CREATE INDEX IF NOT EXISTS idx_vitals_url ON web_vitals(page_url);
CREATE INDEX IF NOT EXISTS idx_vitals_user ON web_vitals(user_id);

-- ✅ View for aggregated metrics
CREATE OR REPLACE VIEW web_vitals_summary AS
SELECT 
  metric_name,
  DATE(timestamp) as date,
  COUNT(*) as sample_count,
  ROUND(AVG(metric_value), 2) as avg_value,
  ROUND(CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) AS NUMERIC), 2) as p50,
  ROUND(CAST(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) AS NUMERIC), 2) as p75,
  ROUND(CAST(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) AS NUMERIC), 2) as p95,
  COUNT(CASE WHEN metric_rating = 'good' THEN 1 END) as good_count,
  COUNT(CASE WHEN metric_rating = 'needs-improvement' THEN 1 END) as needs_improvement_count,
  COUNT(CASE WHEN metric_rating = 'poor' THEN 1 END) as poor_count
FROM web_vitals
GROUP BY metric_name, DATE(timestamp)
ORDER BY date DESC, metric_name;

-- ✅ Enable RLS
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;

-- ✅ RLS Policies
CREATE POLICY "Users can view own vitals"
  ON web_vitals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitals"
  ON web_vitals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ✅ Grant access to view
GRANT SELECT ON web_vitals_summary TO authenticated;
