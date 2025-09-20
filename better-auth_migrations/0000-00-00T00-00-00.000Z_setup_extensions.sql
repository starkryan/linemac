-- Setup PostgreSQL extensions needed for the application
-- This should be the first migration to run

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log extension setup completion
DO $$
BEGIN
    RAISE NOTICE '✅ PostgreSQL extensions setup completed';
END $$;