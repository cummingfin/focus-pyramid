-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own workspace" ON workspaces;
DROP POLICY IF EXISTS "Users can create their own workspace" ON workspaces;
DROP POLICY IF EXISTS "Users can update their own workspace" ON workspaces;
DROP POLICY IF EXISTS "Users can view their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can create their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON memberships;

-- Create simple, working policies
CREATE POLICY "Users can view their own workspaces" ON workspaces
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own workspaces" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can view their own memberships" ON memberships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memberships" ON memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships" ON memberships
  FOR UPDATE USING (auth.uid() = user_id);
