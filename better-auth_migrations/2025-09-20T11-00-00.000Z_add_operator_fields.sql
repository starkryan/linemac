-- Add operator identification fields to user table
-- This migration adds operator_uid and operator_name fields for operator role validation

-- Add operator_uid column for operator identification with default for existing operators
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'operator_uid') THEN
            ALTER TABLE "user" ADD COLUMN operator_uid VARCHAR(50);
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'operator_name') THEN
            ALTER TABLE "user" ADD COLUMN operator_name VARCHAR(100);
        END IF;
    END IF;
END $$;

-- Update existing operator users to have default operator_uid values
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        UPDATE "user" SET operator_uid = 'DEFAULT_' || id WHERE role = 'operator' AND operator_uid IS NULL;
    END IF;
END $$;

-- Add indexes for faster queries
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        CREATE INDEX IF NOT EXISTS idx_user_operator_uid ON "user"(operator_uid);
        CREATE INDEX IF NOT EXISTS idx_user_operator_name ON "user"(operator_name);
    END IF;
END $$;

-- Note: Constraint validation will be handled at application level for better flexibility