-- Better Auth tables for authentication
DO $$
BEGIN
    -- Create user table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user') THEN
        CREATE TABLE "user" (
            "id" TEXT PRIMARY KEY,
            "name" TEXT NOT NULL,
            "email" TEXT NOT NULL UNIQUE,
            "emailVerified" BOOLEAN NOT NULL DEFAULT false,
            "image" TEXT,
            "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        RAISE NOTICE 'Created user table';
    END IF;

    -- Create session table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'session') THEN
        CREATE TABLE "session" (
            "id" TEXT PRIMARY KEY,
            "expiresAt" TIMESTAMPTZ NOT NULL,
            "token" TEXT NOT NULL UNIQUE,
            "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            "updatedAt" TIMESTAMPTZ NOT NULL,
            "ipAddress" TEXT,
            "userAgent" TEXT,
            "userId" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
        );
        RAISE NOTICE 'Created session table';
    END IF;

    -- Create account table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'account') THEN
        CREATE TABLE "account" (
            "id" TEXT PRIMARY KEY,
            "accountId" TEXT NOT NULL,
            "providerId" TEXT NOT NULL,
            "userId" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
            "accessToken" TEXT,
            "refreshToken" TEXT,
            "idToken" TEXT,
            "accessTokenExpiresAt" TIMESTAMPTZ,
            "refreshTokenExpiresAt" TIMESTAMPTZ,
            "scope" TEXT,
            "password" TEXT,
            "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            "updatedAt" TIMESTAMPTZ NOT NULL
        );
        RAISE NOTICE 'Created account table';
    END IF;

    -- Create verification table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'verification') THEN
        CREATE TABLE "verification" (
            "id" TEXT PRIMARY KEY,
            "identifier" TEXT NOT NULL,
            "value" TEXT NOT NULL,
            "expiresAt" TIMESTAMPTZ NOT NULL,
            "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        RAISE NOTICE 'Created verification table';
    END IF;
END $$;