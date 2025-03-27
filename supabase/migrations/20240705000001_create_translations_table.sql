-- Create translations table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,
  UNIQUE(key_id, language_code)
);

-- Enable row level security
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
DROP POLICY IF EXISTS "Public translations access" ON translations;
CREATE POLICY "Public translations access"
ON translations FOR ALL
USING (true);

-- Enable realtime
alter publication supabase_realtime add table translations;