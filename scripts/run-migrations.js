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
        const modifiedSql = sql.replace(/create table (\w+)/gi, 'CREATE TABLE IF NOT EXISTS $1');

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

        // Check if the error is about existing relations
        if (error.message.includes('already exists') ||
            error.code === '42P07' ||
            error.message.includes('duplicate column') ||
            error.message.includes('duplicate relation')) {
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

    // Run admin user creation after migrations
    try {
      await import('./create-admin-user.js');
    } catch (adminError) {
      console.log('⚠️  Admin user creation failed, but migrations completed:', adminError.message);
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