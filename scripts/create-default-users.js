require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createDefaultUsers() {
  console.log('🔧 Creating default users...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Get available columns in user table
    const userColumnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'user'
      ORDER BY ordinal_position
    `);

    const userColumns = userColumnCheck.rows.map(row => row.column_name);
    console.log('📋 User table columns:', userColumns.join(', '));

    // Get available columns in account table
    const accountColumnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'account'
      ORDER BY ordinal_position
    `);

    const accountColumns = accountColumnCheck.rows.map(row => row.column_name);
    console.log('📋 Account table columns:', accountColumns.join(', '));

    // Check if admin user already exists
    const adminCheck = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      ['admin@ucl.test']
    );

    if (adminCheck.rows.length === 0) {
      console.log('📝 Creating admin user...');

      // Create admin user
      const adminId = uuidv4();
      const adminPassword = await bcrypt.hash('admin123', 12);

      // Build user insert query dynamically
      const userInsertCols = ['id', 'name', 'email', 'createdAt', 'updatedAt'];
      const userInsertVals = [adminId, 'System Administrator', 'admin@ucl.test', new Date(), new Date()];
      const userPlaceholders = [];

      // Add optional columns
      if (userColumns.includes('emailVerified') || userColumns.includes('emailverified')) {
        const col = userColumns.includes('emailVerified') ? 'emailVerified' : 'emailverified';
        userInsertCols.push(col);
        userInsertVals.push(true);
      }

      if (userColumns.includes('role')) {
        userInsertCols.push('role');
        userInsertVals.push('admin');
      }

      if (userColumns.includes('aadhaar_number')) {
        userInsertCols.push('aadhaar_number');
        userInsertVals.push('ADMIN001');
      }

      if (userColumns.includes('status')) {
        userInsertCols.push('status');
        userInsertVals.push('active');
      }

      if (userColumns.includes('balance')) {
        userInsertCols.push('balance');
        userInsertVals.push(0.00);
      }

      if (userColumns.includes('is_blocked')) {
        userInsertCols.push('is_blocked');
        userInsertVals.push(false);
      }

      // Create placeholders
      for (let i = 1; i <= userInsertVals.length; i++) {
        userPlaceholders.push(`$${i}`);
      }

      // Insert user
      await pool.query(
        `INSERT INTO "user" (${userInsertCols.map(col => `"${col}"`).join(', ')})
         VALUES (${userPlaceholders.join(', ')})`,
        userInsertVals
      );

      // Create account for admin
      const accountId = uuidv4();
      const accountInsertCols = ['id', 'userId', 'password', 'createdAt', 'updatedAt'];
      const accountInsertVals = [accountId, adminId, adminPassword, new Date(), new Date()];
      const accountPlaceholders = [];

      // Add optional account columns
      if (accountColumns.includes('accountId')) {
        accountInsertCols.push('accountId');
        accountInsertVals.push(adminId);
      }

      if (accountColumns.includes('providerId') || accountColumns.includes('providerid')) {
        const col = accountColumns.includes('providerId') ? 'providerId' : 'providerid';
        accountInsertCols.push(col);
        accountInsertVals.push('credential');
      }

      // Create placeholders for account
      for (let i = 1; i <= accountInsertVals.length; i++) {
        accountPlaceholders.push(`$${i}`);
      }

      // Insert account
      await pool.query(
        `INSERT INTO "account" (${accountInsertCols.map(col => `"${col}"`).join(', ')})
         VALUES (${accountPlaceholders.join(', ')})`,
        accountInsertVals
      );

      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️  Admin user already exists');

      // Update admin user aadhaar_number if not set
      if (!adminCheck.rows[0].aadhaar_number && userColumns.includes('aadhaar_number')) {
        await pool.query(
          'UPDATE "user" SET aadhaar_number = $1 WHERE email = $2',
          ['ADMIN001', 'admin@ucl.test']
        );
        console.log('✅ Admin user updated with aadhaar_number');
      }
    }

    // Check if default operator user already exists
    const operatorCheck = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      ['operator-default_op001@ucl.test']
    );

    if (operatorCheck.rows.length === 0) {
      console.log('📝 Creating default operator user...');

      // Create operator user
      const operatorId = uuidv4();
      const operatorPassword = await bcrypt.hash('operator123', 12);

      // Build user insert query dynamically
      const userInsertCols = ['id', 'name', 'email', 'createdAt', 'updatedAt'];
      const userInsertVals = [operatorId, 'Default Operator', 'operator-default_op001@ucl.test', new Date(), new Date()];
      const userPlaceholders = [];

      // Add optional columns
      if (userColumns.includes('emailVerified') || userColumns.includes('emailverified')) {
        const col = userColumns.includes('emailVerified') ? 'emailVerified' : 'emailverified';
        userInsertCols.push(col);
        userInsertVals.push(true);
      }

      if (userColumns.includes('role')) {
        userInsertCols.push('role');
        userInsertVals.push('operator');
      }

      if (userColumns.includes('aadhaar_number')) {
        userInsertCols.push('aadhaar_number');
        userInsertVals.push('DEFAULT_OP001');
      }

      if (userColumns.includes('status')) {
        userInsertCols.push('status');
        userInsertVals.push('active');
      }

      if (userColumns.includes('balance')) {
        userInsertCols.push('balance');
        userInsertVals.push(0.00);
      }

      if (userColumns.includes('is_blocked')) {
        userInsertCols.push('is_blocked');
        userInsertVals.push(false);
      }

      // Create placeholders
      for (let i = 1; i <= userInsertVals.length; i++) {
        userPlaceholders.push(`$${i}`);
      }

      // Insert user
      await pool.query(
        `INSERT INTO "user" (${userInsertCols.map(col => `"${col}"`).join(', ')})
         VALUES (${userPlaceholders.join(', ')})`,
        userInsertVals
      );

      // Create account for operator
      const accountId = uuidv4();
      const accountInsertCols = ['id', 'userId', 'password', 'createdAt', 'updatedAt'];
      const accountInsertVals = [accountId, operatorId, operatorPassword, new Date(), new Date()];
      const accountPlaceholders = [];

      // Add optional account columns
      if (accountColumns.includes('accountId')) {
        accountInsertCols.push('accountId');
        accountInsertVals.push(operatorId);
      }

      if (accountColumns.includes('providerId') || accountColumns.includes('providerid')) {
        const col = accountColumns.includes('providerId') ? 'providerId' : 'providerid';
        accountInsertCols.push(col);
        accountInsertVals.push('credential');
      }

      // Create placeholders for account
      for (let i = 1; i <= accountInsertVals.length; i++) {
        accountPlaceholders.push(`$${i}`);
      }

      // Insert account
      await pool.query(
        `INSERT INTO "account" (${accountInsertCols.map(col => `"${col}"`).join(', ')})
         VALUES (${accountPlaceholders.join(', ')})`,
        accountInsertVals
      );

      console.log('✅ Default operator user created successfully');
    } else {
      console.log('ℹ️  Default operator user already exists');
    }

    console.log('🎉 Default users setup completed');

    // Display login credentials
    console.log('\n📋 Default Login Credentials:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ ADMIN USER                                              │');
    console.log('│ Operator UID: ADMIN001                                │');
    console.log('│ Operator Name: System Administrator                   │');
    console.log('│ Password: admin123                                     │');
    console.log('│ Role: admin                                           │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ OPERATOR USER                                          │');
    console.log('│ Operator UID: DEFAULT_OP001                           │');
    console.log('│ Operator Name: Default Operator                        │');
    console.log('│ Password: operator123                                  │');
    console.log('│ Role: operator                                         │');
    console.log('└─────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Error creating default users:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Export for use in other scripts
module.exports = { createDefaultUsers };

// Only run if this script is executed directly
if (require.main === module) {
  createDefaultUsers()
    .then(() => {
      console.log('✅ Default users creation process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Default users creation failed:', error);
      process.exit(1);
    });
}