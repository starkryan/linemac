-- Create admin user if it doesn't exist
-- This migration creates the default admin user for the application

-- Check if admin user already exists and insert if not
INSERT INTO "user" (
    "id",
    "name",
    "email",
    "emailVerified",
    "role",
    "status",
    "balance",
    "is_blocked",
    "createdAt",
    "updatedAt"
)
SELECT
    '00000000-0000-0000-0000-000000000001' as id,
    'System Administrator' as name,
    'admin@ucl.test' as email,
    true as emailVerified,
    'admin' as role,
    'active' as status,
    0.00 as balance,
    false as is_blocked,
    CURRENT_TIMESTAMP as createdAt,
    CURRENT_TIMESTAMP as updatedAt
WHERE NOT EXISTS (
    SELECT 1 FROM "user" WHERE email = 'admin@ucl.test' OR role = 'admin'
);

-- Create admin account with password (bcrypt hash of 'admin123')
-- Note: This will be handled by Better Auth when the user first logs in
-- For now, we just create the user record and Better Auth will handle the password