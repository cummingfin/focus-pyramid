-- Get all tables and their structures
SELECT 
    t.table_name,
    t.table_type,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    c.ordinal_position
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public' 
ORDER BY t.table_name, c.ordinal_position;

-- Alternative: Get table count and row count for each table
SELECT 
    schemaname,
    relname as table_name,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY relname;

-- Check if tables have any data
SELECT 
    'workspaces' as table_name, COUNT(*) as row_count FROM workspaces
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
