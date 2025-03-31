-- Drop existing policies
DROP POLICY IF EXISTS "Users can view languages" ON languages;
DROP POLICY IF EXISTS "Authenticated users can insert languages" ON languages;
DROP POLICY IF EXISTS "Authenticated users can update languages" ON languages;

-- Create more permissive policies
CREATE POLICY "Anyone can view languages"
  ON languages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert languages"
  ON languages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update languages"
  ON languages FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete languages"
  ON languages FOR DELETE
  USING (true);
