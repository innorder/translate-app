-- Create translation_keys table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS translation_keys (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  description TEXT,
  namespace_id TEXT,
  project_id TEXT,
  status TEXT DEFAULT 'unconfirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Enable row level security
ALTER TABLE translation_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
DROP POLICY IF EXISTS "Public translation_keys access" ON translation_keys;
CREATE POLICY "Public translation_keys access"
ON translation_keys FOR ALL
USING (true);

-- Enable realtime
alter publication supabase_realtime add table translation_keys;