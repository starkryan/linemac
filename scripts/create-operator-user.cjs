require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createOperatorUser(operatorData) {
  const { operatorUid, operatorName, password } = operatorData;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔧 Creating operator user...');

    // Check if operator already exists
    const existingOperator = await pool.query(
      'SELECT * FROM "user" WHERE aadhaar_number = $1 OR name = $2',
      [operatorUid, operatorName]
    );

    if (existingOperator.rows.length > 0) {
      console.log('⚠️  Operator already exists:', existingOperator.rows[0].name);
      return existingOperator.rows[0];
    }

    // Generate operator user ID and email
    const operatorId = uuidv4();
    const operatorEmail = `operator-${operatorUid.toLowerCase().replace(/\s+/g, '-')}@ucl.test`;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check what columns exist in the user table
    const columnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'user'
      ORDER BY ordinal_position
    `);

    const columns = columnCheck.rows.map(row => row.column_name);

    // Build the insert query dynamically
    const basicColumns = ['id', 'name', 'email', 'createdAt', 'updatedAt'];
    const basicValues = [operatorId, operatorName, operatorEmail, new Date(), new Date()];

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
      insertValues.push('operator');
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

    if (columns.includes('aadhaar_number')) {
      insertColumns.push('aadhaar_number');
      insertValues.push(operatorUid);
    }

    if (columns.includes('operator_uid')) {
      insertColumns.push('operator_uid');
      insertValues.push(operatorUid);
    }

    if (columns.includes('operator_name')) {
      insertColumns.push('operator_name');
      insertValues.push(operatorName);
    }

    // Create placeholders for the query
    for (let i = 1; i <= insertValues.length; i++) {
      valuePlaceholders.push(`$${i}`);
    }

    // Build and execute the query
    const insertQuery = `
      INSERT INTO "user" (${insertColumns.map(col => `"${col}"`).join(', ')})
      VALUES (${valuePlaceholders.join(', ')})
      RETURNING *
    `;

    const result = await pool.query(insertQuery, insertValues);
    const operator = result.rows[0];

    console.log('✅ Operator user created:', operator.name);

    // Check what columns exist in the account table
    const accountColumnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'account'
      ORDER BY ordinal_position
    `);

    const accountColumns = accountColumnCheck.rows.map(row => row.column_name);

    // Build the account insert query dynamically
    const accountBasicColumns = ['id', 'userId', 'password', 'createdAt', 'updatedAt'];
    const accountBasicValues = [uuidv4(), operatorId, hashedPassword, new Date(), new Date()];

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
      accountInsertValues.push(operatorId);
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

    console.log('✅ Operator account created successfully!');
    console.log('📋 Operator Details:');
    console.log('   Name:', operatorName);
    console.log('   UID:', operatorUid);
    console.log('   Email:', operatorEmail);
    console.log('   Password:', password);
    console.log('   Role: operator');

    return operator;

  } catch (error) {
    console.error('❌ Error creating operator user:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Export for use in other scripts
module.exports = { createOperatorUser };

// Only run if this script is executed directly
if (require.main === module) {
  // Get operator data from command line arguments or use defaults
  const args = process.argv.slice(2);

  let operatorUid = args[0] || 'OP001';
  let operatorName = args[1] || 'Test Operator';
  let password = args[2] || 'operator123';

  createOperatorUser({ operatorUid, operatorName, password })
    .then(() => {
      console.log('🎉 Operator creation process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Operator creation failed:', error);
      process.exit(1);
    });
}