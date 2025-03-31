-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members table for team collaboration
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create namespaces table
CREATE TABLE IF NOT EXISTS namespaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_base BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, code)
);

-- Create translation_keys table
CREATE TABLE IF NOT EXISTS translation_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  namespace_id UUID REFERENCES namespaces(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'incomplete' CHECK (status IN ('complete', 'incomplete', 'outdated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(project_id, namespace_id, key)
);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID REFERENCES translation_keys(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(key_id, language_code)
);

-- Create translation_history table for audit trail
CREATE TABLE IF NOT EXISTS translation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  translation_id UUID REFERENCES translations(id) ON DELETE CASCADE,
  previous_value TEXT,
  new_value TEXT,
  action TEXT NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;

-- Projects policies
DROP POLICY IF EXISTS "Users can view projects they are members of";
CREATE POLICY "Users can view projects they are members of"
ON projects FOR SELECT
USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert their own projects";
CREATE POLICY "Users can insert their own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update projects they own or admin";
CREATE POLICY "Users can update projects they own or admin"
ON projects FOR UPDATE
USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);

DROP POLICY IF EXISTS "Users can delete projects they own";
CREATE POLICY "Users can delete projects they own"
ON projects FOR DELETE
USING (auth.uid() = owner_id);

-- Project members policies
DROP POLICY IF EXISTS "Users can view project members for their projects";
CREATE POLICY "Users can view project members for their projects"
ON project_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_members.project_id AND (
      owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = projects.id AND pm.user_id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Project owners and admins can manage members";
CREATE POLICY "Project owners and admins can manage members"
ON project_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_members.project_id AND (
      owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = projects.id AND pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin'))
    )
  )
);

-- Similar policies for other tables (namespaces, languages, translation_keys, translations)
-- These follow the same pattern: users can view if they're project members, and edit based on their role

-- Enable realtime for all tables
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table project_members;
alter publication supabase_realtime add table namespaces;
alter publication supabase_realtime add table languages;
alter publication supabase_realtime add table translation_keys;
alter publication supabase_realtime add table translations;
alter publication supabase_realtime add table translation_history;
