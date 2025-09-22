-- Check if goals are being saved to Supabase
-- This will show all goals with their workspace and area info

SELECT 
    g.id,
    g.workspace_id,
    g.area_id,
    g.horizon,
    g.title,
    g.active,
    g.parent_goal_id,
    g.created_at,
    w.name as workspace_name,
    w.owner_id,
    a.name as area_name
FROM goals g
LEFT JOIN workspaces w ON g.workspace_id = w.id
LEFT JOIN areas a ON g.area_id = a.id
ORDER BY g.created_at DESC;

-- Also check workspaces and memberships to see if they're being created
SELECT 'WORKSPACES' as table_name, COUNT(*) as count FROM workspaces
UNION ALL
SELECT 'MEMBERSHIPS' as table_name, COUNT(*) as count FROM memberships  
UNION ALL
SELECT 'AREAS' as table_name, COUNT(*) as count FROM areas
UNION ALL
SELECT 'GOALS' as table_name, COUNT(*) as count FROM goals;
