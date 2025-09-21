require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Read migration files
    const migrationsDir = path.join(__dirname, '../better-auth_migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct order

    console.log(`Found ${migrationFiles.length} migration files`);

    // Get already executed migrations
    const executedMigrations = await client.query(
      'SELECT migration_name FROM schema_migrations'
    );
    const executedSet = new Set(executedMigrations.rows.map(row => row.migration_name));

    for (const file of migrationFiles) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Migration ${file} already executed, skipping...`);
        continue;
      }

      console.log(`Running migration: ${file}`);

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await client.query('BEGIN');

        // Handle the case where tables might already exist
        // Only add IF NOT EXISTS to CREATE TABLE statements that don't already have it
        let modifiedSql = sql.replace(/create table (\w+)/gi, 'CREATE TABLE IF NOT EXISTS $1');
        // Handle CREATE INDEX IF NOT EXISTS by removing IF NOT EXISTS for compatibility
        modifiedSql = modifiedSql.replace(/create index if not exists (\w+)/gi, 'CREATE INDEX $1');

        await client.query(modifiedSql);

        // Record the migration as executed
        await client.query(
          'INSERT INTO schema_migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
          [file]
        );

        await client.query('COMMIT');
        console.log(`✅ Migration ${file} completed successfully`);
      } catch (error) {
        await client.query('ROLLBACK');

        // Check if the error is about existing relations or indexes
        if (error.message.includes('already exists') ||
            error.code === '42P07' || // relation already exists
            error.code === '42710' || // duplicate_object (includes indexes)
            error.message.includes('duplicate column') ||
            error.message.includes('duplicate relation') ||
            error.message.includes('duplicate index') ||
            error.message.includes('index already exists')) {
          console.log(`⚠️  Migration ${file} already applied (tables exist), recording as executed...`);

          // Still record it as executed to avoid future conflicts
          try {
            await client.query(
              'INSERT INTO schema_migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
              [file]
            );
          } catch (recordError) {
            // Ignore recording errors
          }
        } else {
          console.error(`❌ Migration ${file} failed:`, error.message);
          throw error;
        }
      }
    }

    console.log('🎉 All migrations completed successfully!');

    // Run default users creation after migrations
    try {
      const { createDefaultUsers } = require('./create-default-users.js');
      await createDefaultUsers();
    } catch (adminError) {
      console.log('⚠️  Default users creation failed, but migrations completed:', adminError.message);
      // Don't exit with error code, as migrations were successful
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();