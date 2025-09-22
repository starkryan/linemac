-- Add profile completion tracking fields
-- This migration adds fields to track when a user completes their profile submission

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_submitted_at TIMESTAMP;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profile_completed ON "user"(profile_completed);
CREATE INDEX IF NOT EXISTS idx_user_profile_submitted_at ON "user"(profile_submitted_at);