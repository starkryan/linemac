-- Add additional profile fields for KYC completion
-- This migration adds fields that were missing from the original KYC migration

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS house VARCHAR(100),
ADD COLUMN IF NOT EXISTS street VARCHAR(100),
ADD COLUMN IF NOT EXISTS village VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS pin_code VARCHAR(10);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_phone ON "user"(phone);
CREATE INDEX IF NOT EXISTS idx_user_dob ON "user"(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_user_house ON "user"(house);
CREATE INDEX IF NOT EXISTS idx_user_street ON "user"(street);
CREATE INDEX IF NOT EXISTS idx_user_village ON "user"(village);
CREATE INDEX IF NOT EXISTS idx_user_city ON "user"(city);
CREATE INDEX IF NOT EXISTS idx_user_pin_code ON "user"(pin_code);