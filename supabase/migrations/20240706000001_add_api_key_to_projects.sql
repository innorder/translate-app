-- Add Google Translate API key column to projects table
ALTER TABLE projects ADD COLUMN google_translate_api_key TEXT;

-- Enable RLS for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own projects
DROP POLICY IF EXISTS "Users can view their own projects"
CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
USING (owner_id = auth.uid());

-- Create policy to allow users to update their own projects
DROP POLICY IF EXISTS "Users can update their own projects";
CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
USING (owner_id = auth.uid());
