-- Create pre-market checklist tables

-- Checklists table - stores daily checklist completions
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, profile_id, date)
);

-- Checklist templates - user-defined checklist templates
CREATE TABLE IF NOT EXISTS checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist streaks - tracks completion streaks
CREATE TABLE IF NOT EXISTS checklist_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, profile_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checklists_user_date ON checklists(user_id, profile_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_checklist_templates_user ON checklist_templates(user_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_checklist_streaks_user ON checklist_streaks(user_id, profile_id);

-- RLS Policies
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_streaks ENABLE ROW LEVEL SECURITY;

-- Checklists policies
CREATE POLICY "Users can view their own checklists"
  ON checklists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checklists"
  ON checklists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklists"
  ON checklists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklists"
  ON checklists FOR DELETE
  USING (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Users can view their own templates"
  ON checklist_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON checklist_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON checklist_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON checklist_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view their own streaks"
  ON checklist_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
  ON checklist_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON checklist_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE checklists IS 'Daily pre-market checklist completions';
COMMENT ON TABLE checklist_templates IS 'User-defined checklist templates';
COMMENT ON TABLE checklist_streaks IS 'Checklist completion streaks for gamification';

