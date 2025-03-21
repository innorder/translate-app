-- Create translation history table
CREATE TABLE IF NOT EXISTS translation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID NOT NULL,
  action TEXT NOT NULL,
  user_id UUID,
  user_email TEXT,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
DROP POLICY IF EXISTS "Users can view history" ON translation_history;
CREATE POLICY "Users can view history"
  ON translation_history FOR SELECT
  USING (true);

-- Create policy for insert access
DROP POLICY IF EXISTS "Users can insert history" ON translation_history;
CREATE POLICY "Users can insert history"
  ON translation_history FOR INSERT
  WITH CHECK (true);

-- Add realtime support
alter publication supabase_realtime add table translation_history;
