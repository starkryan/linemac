-- Add role column to user table with default 'operator'
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'operator' CHECK (role IN ('admin', 'supervisor', 'operator'));

-- Add index for role column for faster queries
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);

-- Add phone column for user contact information
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add aadhaar_number column for user identification
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(14);

-- Add status column for user account status
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));

-- Add index for status column
CREATE INDEX IF NOT EXISTS idx_user_status ON "user"(status);

-- Add created_by column to track who created the user (for audit purposes)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES "user"("id");

-- Update existing users to have default role and status
UPDATE "user" SET role = 'operator' WHERE role IS NULL;
UPDATE "user" SET status = 'active' WHERE status IS NULL;