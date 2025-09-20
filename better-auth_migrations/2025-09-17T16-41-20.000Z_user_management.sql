-- Check if user table exists, if not it will be created by the first Better Auth migration
-- Add columns if they don't exist (for backward compatibility)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'balance') THEN
            ALTER TABLE "user" ADD COLUMN balance NUMERIC(10, 2) DEFAULT 0.00;
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'is_blocked') THEN
            ALTER TABLE "user" ADD COLUMN is_blocked BOOLEAN DEFAULT false;
        END IF;
    END IF;
END $$;

-- Add an index for the is_blocked column for faster queries if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        CREATE INDEX IF NOT EXISTS idx_user_is_blocked ON "user"(is_blocked);
    END IF;
END $$;
