const query = require('./src/lib/db').query;

async function testBalanceAPI() {
  try {
    console.log('Testing balance management functionality...\n');

    // Test 1: Check current user balances
    console.log('1. Checking current user balances:');
    const users = await query('SELECT id, name, email, balance FROM "user" WHERE role = \'operator\' LIMIT 3');
    console.log('Users:', users.rows);
    console.log('');

    // Test 2: Test balance credit operation
    console.log('2. Testing balance credit operation:');
    const testUser = users.rows[0];
    if (testUser) {
      const oldBalance = testUser.balance;
      const creditAmount = 50.00;

      console.log(`Crediting ₹${creditAmount} to user ${testUser.name} (ID: ${testUser.id})`);
      console.log(`Old balance: ₹${oldBalance}`);

      // Start transaction
      await query('BEGIN');

      try {
        // Update user balance
        const newBalance = Number(oldBalance) + creditAmount;
        await query('UPDATE "user" SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                   [newBalance, testUser.id]);

        // Create transaction record
        await query(`INSERT INTO transactions (user_id, amount, type, status, description, created_at, updated_at)
                     VALUES ($1, $2, 'credit', 'completed', 'Test credit transaction', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                   [testUser.id, creditAmount]);

        await query('COMMIT');

        // Verify the balance update
        const updatedUser = await query('SELECT balance FROM "user" WHERE id = $1', [testUser.id]);
        console.log(`New balance: ₹${updatedUser.rows[0].balance}`);
        console.log('✅ Credit operation successful');

      } catch (error) {
        await query('ROLLBACK');
        console.log('❌ Credit operation failed:', error.message);
      }
    }
    console.log('');

    // Test 3: Test transaction history
    console.log('3. Testing transaction history:');
    const transactions = await query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
                                   [testUser.id]);
    console.log('Recent transactions:');
    transactions.rows.forEach(tx => {
      console.log(`- ${tx.type}: ₹${tx.amount} (${tx.status}) - ${tx.description}`);
    });
    console.log('');

    // Test 4: Test user search functionality
    console.log('4. Testing user search:');
    const searchResults = await query(`
      SELECT id, name, email, phone, balance
      FROM "user"
      WHERE LOWER(name) ILIKE '%mia%' OR LOWER(email) ILIKE '%mia%'
      LIMIT 5
    `);
    console.log('Search results for "Mia":');
    searchResults.rows.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Balance: ₹${user.balance}`);
    });
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBalanceAPI();