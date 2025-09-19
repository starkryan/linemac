-- Create correction_requests table
CREATE TABLE correction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aadhaar_number VARCHAR(12) NOT NULL,
    mobile_number VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    email VARCHAR(255),
    co VARCHAR(255),
    house_no VARCHAR(255),
    street VARCHAR(255) NOT NULL,
    landmark VARCHAR(255),
    area VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    post_office VARCHAR(255),
    district VARCHAR(255) NOT NULL,
    sub_district VARCHAR(255),
    state VARCHAR(255) NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index for faster lookups
CREATE INDEX idx_correction_requests_aadhaar_number ON correction_requests(aadhaar_number);
CREATE INDEX idx_correction_requests_user_id ON correction_requests(user_id);
CREATE INDEX idx_correction_requests_status ON correction_requests(status);
CREATE INDEX idx_correction_requests_created_at ON correction_requests(created_at);
