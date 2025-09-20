require('dotenv').config();
const { Pool } = require('pg');

async function testFreshDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🧪 Testing admin creation in fresh database...');

    // Drop existing tables to simulate fresh deployment
    console.log('🗑️  Cleaning up existing tables...');
    await pool.query('DROP TABLE IF EXISTS "account" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "user" CASCADE');
    await pool.query('DROP TABLE IF EXISTS schema_migrations CASCADE');

    console.log('✅ Database cleaned');

    // Run migrations including admin creation
    console.log('🔄 Running migrations...');
    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
      const migrate = spawn('npm', ['run', 'migrate'], {
        stdio: 'inherit'
      });

      migrate.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Migrations completed successfully');
          resolve();
        } else {
          reject(new Error('Migrations failed with code ' + code));
        }
      });

      migrate.on('error', reject);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the test
testFreshDatabase()
  .then(() => {
    console.log('🎉 Fresh database test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fresh database test failed:', error);
    process.exit(1);
  });