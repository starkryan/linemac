import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function createAdminUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔧 Creating admin user...');

    // Check if our specific admin user already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      ['admin@ucl.test']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists:', existingAdmin.rows[0].email);
      return;
    }

    // Generate admin user ID
    const adminId = uuidv4();

    // Hash the admin password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    await pool.query(`
      INSERT INTO "user" (
        id, name, email, emailVerified, role, status, balance, is_blocked, createdAt, updatedAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      adminId,
      'System Administrator',
      'admin@ucl.test',
      true,
      'admin',
      'active',
      0.00,
      false,
      new Date(),
      new Date()
    ]);

    // Create account for admin user with email/password authentication
    await pool.query(`
      INSERT INTO "account" (
        id, providerId, accountId, userId, password, createdAt, updatedAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      uuidv4(),
      'credential',
      adminId,
      adminId,
      hashedPassword,
      new Date(),
      new Date()
    ]);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@ucl.test');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminUser()
    .then(() => {
      console.log('🎉 Admin user creation process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin user creation failed:', error);
      process.exit(1);
    });
}

export { createAdminUser };