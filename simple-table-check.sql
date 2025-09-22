-- Simple query to see all your tables and their structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- Check row counts for each table
SELECT 'workspaces' as table_name, COUNT(*) as row_count FROM workspaces
UNION ALL
SELECT 'memberships', COUNT(*) FROM memberships
UNION ALL
SELECT 'areas', COUNT(*) FROM areas
UNION ALL
SELECT 'goals', COUNT(*) FROM goals
UNION ALL
SELECT 'days', COUNT(*) FROM days
UNION ALL
SELECT 'daily_outcomes', COUNT(*) FROM daily_outcomes
UNION ALL
SELECT 'recovery_checks', COUNT(*) FROM recovery_checks
UNION ALL
SELECT 'distractions', COUNT(*) FROM distractions
UNION ALL
SELECT 'streaks', COUNT(*) FROM streaks;
