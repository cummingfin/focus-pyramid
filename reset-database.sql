-- COMPLETE DATABASE RESET FOR FOCUS PYRAMID
-- This will delete all existing data and recreate tables properly

-- ==============================================
-- STEP 1: DROP ALL EXISTING TABLES AND POLICIES
-- ==============================================

-- Drop all RLS policies first
DROP POLICY IF EXISTS "workspaces_policy" ON workspaces;
DROP POLICY IF EXISTS "memberships_policy" ON memberships;
DROP POLICY IF EXISTS "areas_policy" ON areas;
DROP POLICY IF EXISTS "goals_policy" ON goals;
DROP POLICY IF EXISTS "members read goals" ON goals;
DROP POLICY IF EXISTS "editors modify goals" ON goals;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS areas CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS daily_outcomes CASCADE;
DROP TABLE IF EXISTS days CASCADE;
DROP TABLE IF EXISTS recovery_checks CASCADE;
DROP TABLE IF EXISTS distractions CASCADE;
DROP TABLE IF EXISTS streaks CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS horizon CASCADE;
DROP TYPE IF EXISTS role CASCADE;

-- ==============================================
-- STEP 2: CREATE CUSTOM TYPES
-- ==============================================

-- Create horizon enum (matching your frontend values)
CREATE TYPE horizon AS ENUM (
    'daily',
    'weekly', 
    'monthly',
    'yearly',
    'five_year'  -- Note: using snake_case for database
);

-- Create role enum
CREATE TYPE role AS ENUM (
    'owner',
    'editor',
    'viewer'
);

-- ==============================================
-- STEP 3: CREATE TABLES
-- ==============================================

-- Workspaces table
CREATE TABLE workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memberships table
CREATE TABLE memberships (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role role NOT NULL DEFAULT 'owner',
    PRIMARY KEY (workspace_id, user_id)
);

-- Areas table
CREATE TABLE areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table (main table for your app)
CREATE TABLE goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    horizon horizon NOT NULL,
    title TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    parent_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_workspace_id ON memberships(workspace_id);
CREATE INDEX idx_areas_workspace_id ON areas(workspace_id);
CREATE INDEX idx_goals_workspace_id ON goals(workspace_id);
CREATE INDEX idx_goals_horizon ON goals(horizon);
CREATE INDEX idx_goals_active ON goals(active);

-- ==============================================
-- STEP 5: CREATE ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view their workspaces" ON workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.workspace_id = workspaces.id 
            AND memberships.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create workspaces" ON workspaces
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can update their workspaces" ON workspaces
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can delete their workspaces" ON workspaces
    FOR DELETE USING (auth.uid() = owner_id);

-- Memberships policies
CREATE POLICY "Users can view their memberships" ON memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create memberships in their workspaces" ON memberships
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspaces 
            WHERE workspaces.id = memberships.workspace_id 
            AND workspaces.owner_id = auth.uid()
        )
    );

CREATE POLICY "Workspace owners can update memberships" ON memberships
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workspaces 
            WHERE workspaces.id = memberships.workspace_id 
            AND workspaces.owner_id = auth.uid()
        )
    );

CREATE POLICY "Workspace owners can delete memberships" ON memberships
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workspaces 
            WHERE workspaces.id = memberships.workspace_id 
            AND workspaces.owner_id = auth.uid()
        )
    );

-- Areas policies
CREATE POLICY "Users can view areas in their workspaces" ON areas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.workspace_id = areas.workspace_id 
            AND memberships.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create areas in their workspaces" ON areas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.workspace_id = areas.workspace_id 
            AND memberships.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update areas in their workspaces" ON areas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.workspace_id = areas.workspace_id 
            AND memberships.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete areas in their workspaces" ON areas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.workspace_id = areas.workspace_id 
            AND memberships.user_id = auth.uid()
        )
    );

-- Goals policies
CREATE POLICY "Users can view goals in their workspaces" ON goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.workspace_id = goals.workspace_id 
            AND memberships.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create goals in their workspaces" ON goals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.workspace_id = goals.workspace_id 
            AND memberships.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update goals in their workspaces" ON goals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.workspace_id = goals.workspace_id 
            AND memberships.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete goals in their workspaces" ON goals
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.workspace_id = goals.workspace_id 
            AND memberships.user_id = auth.uid()
        )
    );

-- ==============================================
-- STEP 6: CREATE HELPER FUNCTIONS
-- ==============================================

-- Function to create a default workspace and area for a new user
CREATE OR REPLACE FUNCTION create_user_workspace(user_id UUID)
RETURNS UUID AS $$
DECLARE
    workspace_id UUID;
    area_id UUID;
BEGIN
    -- Create workspace
    INSERT INTO workspaces (name, owner_id)
    VALUES ('My Workspace', user_id)
    RETURNING id INTO workspace_id;
    
    -- Create membership
    INSERT INTO memberships (workspace_id, user_id, role)
    VALUES (workspace_id, user_id, 'owner');
    
    -- Create default area
    INSERT INTO areas (workspace_id, name, is_default)
    VALUES (workspace_id, 'General', TRUE)
    RETURNING id INTO area_id;
    
    RETURN workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- STEP 7: VERIFY SETUP
-- ==============================================

-- Check that everything was created properly
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'Policies created:' as status;
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT 'Types created:' as status;
SELECT typname FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e'
ORDER BY typname;
