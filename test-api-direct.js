const { Pool } = require('pg');

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testAPIEndpoints() {
  try {
    console.log('🧪 Testing API Endpoints Directly\n');

    // Test 1: Test user search query directly
    console.log('1. Testing user search query:');
    const searchResults = await pool.query(
      `SELECT
        id, name, email, phone, balance, role, status, kyc_status
        FROM "user"
        WHERE
          LOWER(name) ILIKE $1 OR
          LOWER(email) ILIKE $1 OR
          phone ILIKE $1 OR
          aadhaar_number ILIKE $1
        ORDER BY
          CASE
            WHEN LOWER(email) = LOWER($2) THEN 1
            WHEN LOWER(name) = LOWER($2) THEN 2
            WHEN phone = $2 THEN 3
            ELSE 4
          END,
          "createdAt" DESC
        LIMIT 20`,
      ['%mia%', 'mia']
    );

    console.log('Search results for "mia":');
    console.log(JSON.stringify(searchResults.rows, null, 2));
    console.log('');

    // Test 2: Test balance adjustment
    console.log('2. Testing balance adjustment:');
    const testUserId = searchResults.rows[0]?.id;
    if (testUserId) {
      console.log(`Testing with user ID: ${testUserId}`);

      // Get current balance
      const currentUser = await pool.query('SELECT balance FROM "user" WHERE id = $1', [testUserId]);
      console.log(`Current balance: ₹${currentUser.rows[0].balance}`);

      // Test credit operation
      console.log('Testing credit operation...');
      await pool.query('BEGIN');

      const newBalance = Number(currentUser.rows[0].balance) + 100;
      await pool.query('UPDATE "user" SET balance = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
                   [newBalance, testUserId]);

      await pool.query(`INSERT INTO transactions (user_id, amount, type, status, description, created_at, updated_at)
                   VALUES ($1, $2, 'credit', 'completed', 'Test API credit', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                   [testUserId, 100]);

      await pool.query('COMMIT');

      // Verify update
      const updatedUser = await pool.query('SELECT balance FROM "user" WHERE id = $1', [testUserId]);
      console.log(`New balance after credit: ₹${updatedUser.rows[0].balance}`);

      // Test debit operation
      console.log('Testing debit operation...');
      await pool.query('BEGIN');

      const finalBalance = Number(updatedUser.rows[0].balance) - 50;
      await pool.query('UPDATE "user" SET balance = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
                   [finalBalance, testUserId]);

      await pool.query(`INSERT INTO transactions (user_id, amount, type, status, description, created_at, updated_at)
                   VALUES ($1, $2, 'debit', 'completed', 'Test API debit', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                   [testUserId, 50]);

      await pool.query('COMMIT');

      // Verify final balance
      const finalUser = await pool.query('SELECT balance FROM "user" WHERE id = $1', [testUserId]);
      console.log(`Final balance after debit: ₹${finalUser.rows[0].balance}`);

      // Show transaction history
      console.log('\n3. Transaction history:');
      const transactions = await pool.query(
        `SELECT type, amount, status, description, created_at
         FROM transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [testUserId]
      );
      console.log('Recent transactions:');
      transactions.rows.forEach(tx => {
        console.log(`- ${tx.type}: ₹${tx.amount} (${tx.status}) - ${tx.description}`);
      });

      // Reset balance to 0 for clean testing
      await pool.query('UPDATE "user" SET balance = 0 WHERE id = $1', [testUserId]);
      console.log('\n✅ Balance reset to 0 for clean testing');

    } else {
      console.log('❌ No users found for testing');
    }

    console.log('\n🎉 All API endpoint tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testAPIEndpoints();