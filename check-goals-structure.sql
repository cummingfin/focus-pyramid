-- Check the exact structure of your existing goals table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'goals'
ORDER BY ordinal_position;

-- Check what data is currently in the goals table
SELECT * FROM goals LIMIT 5;

-- Check if there are any existing workspaces and memberships
SELECT COUNT(*) as workspace_count FROM workspaces;
SELECT COUNT(*) as membership_count FROM memberships;
