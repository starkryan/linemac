const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://ippb:Laudalega@localhost:5432/betterauth'
});

async function showTestCredentials() {
  const client = await pool.connect();

  try {
    console.log('🔧 Available Test Credentials\n');
    console.log('=============================================\n');

    // Get admin accounts
    const adminResult = await client.query(
      'SELECT aadhaar_number, name, email FROM "user" WHERE role = \'admin\' ORDER BY name'
    );

    if (adminResult.rows.length > 0) {
      console.log('👑 ADMIN ACCOUNTS:');
      console.log('────────────────────────────────');
      adminResult.rows.forEach((admin, index) => {
        console.log(`${index + 1}. Admin UID: ${admin.aadhaar_number}`);
        console.log(`   Admin Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: admin123 (or your custom password)`);
        console.log('');
      });
    }

    // Get operator accounts
    const operatorResult = await client.query(
      'SELECT aadhaar_number, name, email FROM "user" WHERE role = \'operator\' ORDER BY name'
    );

    if (operatorResult.rows.length > 0) {
      console.log('🔧 OPERATOR ACCOUNTS:');
      console.log('────────────────────────────────');
      operatorResult.rows.forEach((operator, index) => {
        console.log(`${index + 1}. Operator UID: ${operator.aadhaar_number}`);
        console.log(`   Operator Name: ${operator.name}`);
        console.log(`   Email: ${operator.email}`);
        console.log(`   Password: operator123 (or your custom password)`);
        console.log('');
      });
    }

    console.log('🌐 LOGIN URL:');
    console.log('http://localhost:3001/login');
    console.log('');

    console.log('📋 USAGE:');
    console.log('• Use Admin UID + Admin Name + Password for admin login');
    console.log('• Use Operator UID + Operator Name + Password for operator login');
    console.log('• The login system now supports both roles automatically!');

  } catch (error) {
    console.error('❌ Error fetching credentials:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
showTestCredentials().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});