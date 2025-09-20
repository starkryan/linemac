-- Add balance column if it doesn't exist (only if user table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'balance') THEN
            ALTER TABLE "user" ADD COLUMN balance NUMERIC(10, 2) DEFAULT 0.00;
        END IF;
    END IF;
END $$;

-- Add index for faster balance queries (optional, might be useful for future features)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        CREATE INDEX IF NOT EXISTS idx_user_balance ON "user"(balance);
    END IF;
END $$;

-- Update any existing users to have 0 balance (should already be handled by DEFAULT)
-- This is just to ensure consistency
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        UPDATE "user" SET balance = 0.00 WHERE balance IS NULL;
    END IF;
END $$;