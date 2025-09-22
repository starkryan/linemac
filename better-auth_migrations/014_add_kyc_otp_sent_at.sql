-- Add kyc_otp_sent_at column to user table
-- This column tracks when KYC OTP was last sent for rate limiting
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS kyc_otp_sent_at timestamp with time zone;

-- Add comment for documentation
COMMENT ON COLUMN "user".kyc_otp_sent_at IS 'Timestamp when KYC OTP was last sent, used for rate limiting';