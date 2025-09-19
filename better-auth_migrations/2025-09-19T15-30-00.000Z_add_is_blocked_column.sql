-- Add is_blocked column to user table for account management
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Add index for is_blocked column for faster queries
CREATE INDEX IF NOT EXISTS idx_user_is_blocked ON "user"(is_blocked);

-- Update existing users to not be blocked (should already be handled by DEFAULT)
UPDATE "user" SET is_blocked = false WHERE is_blocked IS NULL;