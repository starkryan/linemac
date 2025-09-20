-- Add columns if they don't exist (for backward compatibility)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'role') THEN
            ALTER TABLE "user" ADD COLUMN role VARCHAR(20) DEFAULT 'operator' CHECK (role IN ('admin', 'supervisor', 'operator'));
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'phone') THEN
            ALTER TABLE "user" ADD COLUMN phone VARCHAR(20);
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'aadhaar_number') THEN
            ALTER TABLE "user" ADD COLUMN aadhaar_number VARCHAR(14);
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'status') THEN
            ALTER TABLE "user" ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'created_by') THEN
            ALTER TABLE "user" ADD COLUMN created_by TEXT REFERENCES "user"("id");
        END IF;
    END IF;
END $$;

-- Add indexes for faster queries
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);
        CREATE INDEX IF NOT EXISTS idx_user_status ON "user"(status);
    END IF;
END $$;

-- Update existing users to have default role and status
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        UPDATE "user" SET role = 'operator' WHERE role IS NULL;
        UPDATE "user" SET status = 'active' WHERE status IS NULL;
    END IF;
END $$;