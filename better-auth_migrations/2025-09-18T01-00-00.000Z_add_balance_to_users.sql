-- Add balance column to users table for wallet functionality
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS balance NUMERIC(10, 2) DEFAULT 0.00;

-- Add index for faster balance queries (optional, might be useful for future features)
CREATE INDEX IF NOT EXISTS idx_user_balance ON "user"(balance);

-- Update any existing users to have 0 balance (should already be handled by DEFAULT)
-- This is just to ensure consistency
UPDATE "user" SET balance = 0.00 WHERE balance IS NULL;