-- Get the structure of each table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('workspaces', 'memberships', 'areas', 'goals', 'days', 'daily_outcomes')
ORDER BY table_name, ordinal_position;
