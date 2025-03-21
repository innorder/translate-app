-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create RLS policies for API keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
DROP POLICY IF EXISTS "Users can view their own API keys";
CREATE POLICY "Users can view their own API keys"
ON api_keys FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own API keys
DROP POLICY IF EXISTS "Users can insert their own API keys";
CREATE POLICY "Users can insert their own API keys"
ON api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own API keys
DROP POLICY IF EXISTS "Users can update their own API keys";
CREATE POLICY "Users can update their own API keys"
ON api_keys FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own API keys
DROP POLICY IF EXISTS "Users can delete their own API keys";
CREATE POLICY "Users can delete their own API keys"
ON api_keys FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for API keys
alter publication supabase_realtime add table api_keys;
