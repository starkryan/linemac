require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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

    // Check what columns exist in the user table
    const columnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'user'
      ORDER BY ordinal_position
    `);

    const columns = columnCheck.rows.map(row => row.column_name);
    console.log('📋 Available columns in user table:', columns.join(', '));

    // Build the insert query dynamically based on available columns
    const basicColumns = ['id', 'name', 'email', 'createdAt', 'updatedAt'];
    const basicValues = [adminId, 'System Administrator', 'admin@ucl.test', new Date(), new Date()];

    let insertColumns = [...basicColumns];
    let insertValues = [...basicValues];
    let valuePlaceholders = [];

    // Add optional columns if they exist
    if (columns.includes('emailVerified') || columns.includes('emailverified')) {
      const emailVerifiedCol = columns.includes('emailVerified') ? 'emailVerified' : 'emailverified';
      insertColumns.push(emailVerifiedCol);
      insertValues.push(true);
    }

    if (columns.includes('role')) {
      insertColumns.push('role');
      insertValues.push('admin');
    }

    if (columns.includes('status')) {
      insertColumns.push('status');
      insertValues.push('active');
    }

    if (columns.includes('balance')) {
      insertColumns.push('balance');
      insertValues.push(0.00);
    }

    if (columns.includes('is_blocked')) {
      insertColumns.push('is_blocked');
      insertValues.push(false);
    }

    // Create placeholders for the query
    for (let i = 1; i <= insertValues.length; i++) {
      valuePlaceholders.push(`$${i}`);
    }

    // Build and execute the query
    const insertQuery = `
      INSERT INTO "user" (${insertColumns.map(col => `"${col}"`).join(', ')})
      VALUES (${valuePlaceholders.join(', ')})
    `;

    await pool.query(insertQuery, insertValues);

    // Check what columns exist in the account table
    const accountColumnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'account'
      ORDER BY ordinal_position
    `);

    const accountColumns = accountColumnCheck.rows.map(row => row.column_name);
    console.log('📋 Available columns in account table:', accountColumns.join(', '));

    // Build the account insert query dynamically
    const accountBasicColumns = ['id', 'userId', 'password', 'createdAt', 'updatedAt'];
    const accountBasicValues = [uuidv4(), adminId, hashedPassword, new Date(), new Date()];

    let accountInsertColumns = [...accountBasicColumns];
    let accountInsertValues = [...accountBasicValues];
    let accountValuePlaceholders = [];

    // Add optional columns if they exist
    if (accountColumns.includes('providerId') || accountColumns.includes('providerid')) {
      const providerIdCol = accountColumns.includes('providerId') ? 'providerId' : 'providerid';
      accountInsertColumns.push(providerIdCol);
      accountInsertValues.push('credential');
    }

    if (accountColumns.includes('accountId')) {
      accountInsertColumns.push('accountId');
      accountInsertValues.push(adminId);
    }

    // Create placeholders for the account query
    for (let i = 1; i <= accountInsertValues.length; i++) {
      accountValuePlaceholders.push(`$${i}`);
    }

    // Build and execute the account query
    const accountInsertQuery = `
      INSERT INTO "account" (${accountInsertColumns.map(col => `"${col}"`).join(', ')})
      VALUES (${accountValuePlaceholders.join(', ')})
    `;

    await pool.query(accountInsertQuery, accountInsertValues);

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

// Also export the operator creation function
const { createOperatorUser } = require('./create-operator-user.cjs');

// Export for use in other scripts
module.exports = { createAdminUser, createOperatorUser };

// Only run if this script is executed directly
if (require.main === module) {
  Promise.all([
    createAdminUser(),
    createOperatorUser({ operatorUid: 'DEFAULT_OP001', operatorName: 'Default Operator', password: 'operator123' })
  ])
    .then(() => {
      console.log('🎉 Admin and default operator creation process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin/operator creation failed:', error);
      process.exit(1);
    });
}