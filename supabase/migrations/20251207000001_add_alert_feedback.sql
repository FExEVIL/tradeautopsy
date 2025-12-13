-- Add feedback fields to predictive_alerts table
DO $$ 
BEGIN
  -- Add helpful field if it doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'predictive_alerts') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'predictive_alerts' AND column_name = 'helpful') THEN
      ALTER TABLE predictive_alerts ADD COLUMN helpful BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'predictive_alerts' AND column_name = 'feedback_notes') THEN
      ALTER TABLE predictive_alerts ADD COLUMN feedback_notes TEXT;
    END IF;
  END IF;
END $$;

-- Create alert effectiveness analytics view
CREATE OR REPLACE VIEW alert_effectiveness_stats AS
SELECT 
  user_id,
  alert_type,
  COUNT(*) as total_alerts,
  COUNT(*) FILTER (WHERE user_action = 'heeded') as heeded_count,
  COUNT(*) FILTER (WHERE helpful = true) as helpful_count,
  COUNT(*) FILTER (WHERE helpful = false) as not_helpful_count,
  COUNT(*) FILTER (WHERE dismissed = true) as dismissed_count,
  ROUND(AVG(confidence)::numeric, 2) as avg_confidence,
  ROUND(
    (COUNT(*) FILTER (WHERE user_action = 'heeded')::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as heeded_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE helpful = true)::numeric / NULLIF(COUNT(*) FILTER (WHERE helpful IS NOT NULL), 0)) * 100,
    2
  ) as helpful_rate
FROM predictive_alerts
GROUP BY user_id, alert_type;
