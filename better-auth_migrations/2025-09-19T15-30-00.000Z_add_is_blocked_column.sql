-- Add is_blocked column if it doesn't exist (only if user table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'is_blocked') THEN
            ALTER TABLE "user" ADD COLUMN is_blocked BOOLEAN DEFAULT false;
        END IF;
    END IF;
END $$;

-- Add index for is_blocked column for faster queries
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        CREATE INDEX IF NOT EXISTS idx_user_is_blocked ON "user"(is_blocked);
    END IF;
END $$;

-- Update existing users to not be blocked (should already be handled by DEFAULT)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        UPDATE "user" SET is_blocked = false WHERE is_blocked IS NULL;
    END IF;
END $$;