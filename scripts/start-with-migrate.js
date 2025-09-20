require('dotenv').config();
const { spawn } = require('child_process');
const { Client } = require('pg');

async function runMigrations() {
  console.log('🔄 Running database migrations...');

  return new Promise((resolve, reject) => {
    const migrate = spawn('npm', ['run', 'migrate'], {
      stdio: 'inherit'
    });

    migrate.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Migrations completed');
        resolve();
      } else {
        console.error('❌ Migrations failed');
        reject(new Error('Migrations failed'));
      }
    });

    migrate.on('error', reject);
  });
}

async function createDefaultUsers() {
  console.log('🔧 Creating default users...');

  return new Promise((resolve, reject) => {
    const createUsers = spawn('node', ['scripts/create-default-users.js'], {
      stdio: 'inherit'
    });

    createUsers.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Default users created');
        resolve();
      } else {
        console.error('❌ Default users creation failed');
        reject(new Error('Default users creation failed'));
      }
    });

    createUsers.on('error', reject);
  });
}

async function waitForDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log('✅ Database is ready');
      return;
    } catch (error) {
      attempts++;
      console.log(`⏳ Database not ready, attempt ${attempts}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  throw new Error('Database not ready after maximum attempts');
}

async function main() {
  try {
    await waitForDatabase();
    await runMigrations();
    await createDefaultUsers();

    console.log('🚀 Starting Next.js application...');
    const next = spawn('npm', ['run', 'start:next'], {
      stdio: 'inherit'
    });

    next.on('close', (code) => {
      process.exit(code || 0);
    });
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
}

main();