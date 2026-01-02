-- Create feedback table for user feedback, feature requests, and bug reports

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Feedback type
  type VARCHAR(20) NOT NULL CHECK (type IN ('feature', 'bug', 'general', 'rating')),
  
  -- Common fields
  title TEXT,
  description TEXT,
  email VARCHAR(255),
  
  -- Feature request fields
  importance INTEGER CHECK (importance >= 1 AND importance <= 5),
  
  -- Bug report fields
  steps TEXT,
  expected TEXT,
  actual TEXT,
  
  -- Rating fields
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  nps INTEGER CHECK (nps >= 0 AND nps <= 10),
  likes TEXT,
  improvements TEXT,
  
  -- Metadata
  url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'closed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- RLS Policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert feedback (including anonymous)
CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- Users can update their own feedback (within 24 hours)
CREATE POLICY "Users can update their own feedback"
  ON feedback FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND created_at > NOW() - INTERVAL '24 hours'
  );

-- Comments
COMMENT ON TABLE feedback IS 'User feedback, feature requests, bug reports, and ratings';
COMMENT ON COLUMN feedback.type IS 'Type of feedback: feature, bug, general, or rating';
COMMENT ON COLUMN feedback.status IS 'Status: new, reviewed, in_progress, resolved, closed';
COMMENT ON COLUMN feedback.nps IS 'Net Promoter Score (0-10)';

