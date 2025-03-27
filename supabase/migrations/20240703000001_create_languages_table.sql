-- Create languages table if it doesn't exist already
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_base BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- Add unique constraint on code and project_id
ALTER TABLE languages ADD CONSTRAINT unique_language_code_per_project UNIQUE (code, project_id);

-- Enable RLS
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view languages" ON languages;
CREATE POLICY "Users can view languages"
  ON languages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert languages" ON languages;
CREATE POLICY "Authenticated users can insert languages"
  ON languages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update languages" ON languages;
CREATE POLICY "Authenticated users can update languages"
  ON languages FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Enable realtime
alter publication supabase_realtime add table languages;

-- Insert default languages
INSERT INTO languages (code, name, is_base, project_id)
VALUES 
  ('en', 'English', TRUE, (SELECT id FROM projects LIMIT 1)),
  ('fr', 'French', FALSE, (SELECT id FROM projects LIMIT 1)),
  ('es', 'Spanish', FALSE, (SELECT id FROM projects LIMIT 1)),
  ('de', 'German', FALSE, (SELECT id FROM projects LIMIT 1))
ON CONFLICT (code, project_id) DO NOTHING;
