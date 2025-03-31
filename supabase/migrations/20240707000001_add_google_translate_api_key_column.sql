-- Add google_translate_api_key column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS google_translate_api_key TEXT;

-- Enable row level security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for accessing projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for updating projects
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Add to realtime publication
alter publication supabase_realtime add table projects;