-- Check what horizon enum values exist in the database
SELECT unnest(enum_range(NULL::horizon)) as horizon_values;

-- Check the goals table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'goals' 
ORDER BY ordinal_position;
