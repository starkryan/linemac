-- Add new columns to correction_requests table for expanded form data
ALTER TABLE correction_requests
ADD COLUMN IF NOT EXISTS name_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS npr_receipt VARCHAR(100),
ADD COLUMN IF NOT EXISTS co_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS house_no_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS street_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS landmark_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS area_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS city_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS post_office_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS district_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS sub_district_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS state_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS head_of_family_name VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS head_of_family_name_hindi VARCHAR(255),
ADD COLUMN IF NOT EXISTS relationship VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS relationship_hindi VARCHAR(100),
ADD COLUMN IF NOT EXISTS relative_aadhaar VARCHAR(12),
ADD COLUMN IF NOT EXISTS relative_contact VARCHAR(15),
ADD COLUMN IF NOT EXISTS same_address BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dob_proof_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS identity_proof_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS address_proof_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS por_document_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS appointment_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS residential_status VARCHAR(50);

-- Update existing rows to have default values for new NOT NULL columns
UPDATE correction_requests
SET head_of_family_name = '', relationship = ''
WHERE head_of_family_name IS NULL OR relationship IS NULL;