const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://ippb:Laudalega@localhost:5432/betterauth'
});

async function createAdminUser() {
  try {
    // Hash the password using the same method as Better Auth (bcrypt with 12 rounds)
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Admin user details
    const adminUser = {
      email: 'admin@ucl.test',
      name: 'System Administrator',
      password: hashedPassword,
      role: 'admin',
      aadhaar_number: 'ADMIN123',
      phone: '+919876543210',
      status: 'active'
    };

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM "user" WHERE email = $1',
      [adminUser.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists. Updating password...');

      const userId = existingUser.rows[0].id;

      // Update the user record first
      await pool.query(
        `UPDATE "user"
         SET name = $1, role = $2, phone = $3, aadhaar_number = $4, status = $5
         WHERE id = $6`,
        [adminUser.name, adminUser.role, adminUser.phone, adminUser.aadhaar_number, adminUser.status, userId]
      );

      // Update the account password
      await pool.query(
        `UPDATE account SET password = $1 WHERE "userId" = $2`,
        [hashedPassword, userId]
      );

      console.log('Admin user updated successfully!');
    } else {
      console.log('Creating new admin user...');

      // Generate a UUID for the user
      const userId = 'admin_' + Date.now();

      // Insert into user table
      await pool.query(
        `INSERT INTO "user" (
          id, name, email, "emailVerified", image, "createdAt", "updatedAt",
          balance, "is_blocked", role, phone, aadhaar_number, status
        ) VALUES (
          $1, $2, $3, true, null, NOW(), NOW(),
          0, false, $4, $5, $6, $7
        )`,
        [
          userId,
          adminUser.name,
          adminUser.email,
          adminUser.role,
          adminUser.phone,
          adminUser.aadhaar_number,
          adminUser.status
        ]
      );

      // Insert into account table
      await pool.query(
        `INSERT INTO account (
          id, "accountId", "providerId", "userId", "password", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(),
          $1,
          'credential',
          $2,
          $3,
          NOW(),
          NOW()
        )`,
        [adminUser.email, userId, hashedPassword]
      );

      console.log('Admin user created successfully!');
    }

    console.log('\nAdmin Login Credentials:');
    console.log('========================');
    console.log('Operator UID: ADMIN123');
    console.log('Operator Name: System Administrator');
    console.log('Password: admin123');
    console.log('========================');
    console.log('You can now access the admin panel at: http://localhost:3000/admin');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

// Load environment variables
require('dotenv').config();

createAdminUser();