-- Add KYC related columns to user table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'kyc_status') THEN
            ALTER TABLE "user" ADD COLUMN kyc_status VARCHAR(20) DEFAULT 'not_started';
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'kyc_photo_url') THEN
            ALTER TABLE "user" ADD COLUMN kyc_photo_url TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'kyc_otp') THEN
            ALTER TABLE "user" ADD COLUMN kyc_otp VARCHAR(6);
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'kyc_otp_expires_at') THEN
            ALTER TABLE "user" ADD COLUMN kyc_otp_expires_at TIMESTAMPTZ;
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'kyc_verified_at') THEN
            ALTER TABLE "user" ADD COLUMN kyc_verified_at TIMESTAMPTZ;
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'full_name') THEN
            ALTER TABLE "user" ADD COLUMN full_name VARCHAR(255);
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'phone') THEN
            ALTER TABLE "user" ADD COLUMN phone VARCHAR(20);
        END IF;

        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"user"'::regclass AND attname = 'address') THEN
            ALTER TABLE "user" ADD COLUMN address TEXT;
        END IF;
    END IF;
END $$;

-- Create index for KYC status for faster queries
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        CREATE INDEX IF NOT EXISTS idx_user_kyc_status ON "user"(kyc_status);
    END IF;
END $$;