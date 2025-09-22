-- Fix RLS infinite recursion issue
-- This will temporarily disable RLS for the problematic tables

-- Disable RLS for all tables to fix the infinite recursion
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;

-- Optional: Create simple, non-recursive policies if you want to re-enable RLS later
-- (Uncomment these if you want to re-enable RLS with simple policies)

-- DROP POLICY IF EXISTS "workspaces_policy" ON workspaces;
-- CREATE POLICY "workspaces_policy" ON workspaces
--   FOR ALL USING (auth.uid() = owner_id);

-- DROP POLICY IF EXISTS "memberships_policy" ON memberships;
-- CREATE POLICY "memberships_policy" ON memberships
--   FOR ALL USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "areas_policy" ON areas;
-- CREATE POLICY "areas_policy" ON areas
--   FOR ALL USING (true);

-- DROP POLICY IF EXISTS "goals_policy" ON goals;
-- CREATE POLICY "goals_policy" ON goals
--   FOR ALL USING (true);

-- Re-enable RLS with simple policies (uncomment if you want RLS back)
-- ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
