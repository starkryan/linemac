-- Add operator identification fields to user table
-- This migration adds operator_uid and operator_name fields for operator role validation

-- Add operator_uid column for operator identification with default for existing operators
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS operator_uid VARCHAR(50);

-- Add operator_name column for operator display name
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS operator_name VARCHAR(100);

-- Update existing operator users to have default operator_uid values
UPDATE "user" SET operator_uid = 'DEFAULT_' || id WHERE role = 'operator' AND operator_uid IS NULL;

-- Add index for operator_uid column for faster queries
CREATE INDEX IF NOT EXISTS idx_user_operator_uid ON "user"(operator_uid);

-- Add index for operator_name column
CREATE INDEX IF NOT EXISTS idx_user_operator_name ON "user"(operator_name);

-- Note: Constraint validation will be handled at application level for better flexibility