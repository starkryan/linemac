-- Add balance and is_blocked columns to the user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS balance NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Add an index for the is_blocked column for faster queries
CREATE INDEX IF NOT EXISTS idx_user_is_blocked ON "user"(is_blocked);
