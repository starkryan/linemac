const { query } = require('./src/lib/db.ts');

async function checkAadhaarFormat() {
  try {
    const result = await query('SELECT id, aadhaar_number, name FROM "user" LIMIT 5;');
    console.log('Aadhaar number format:', result.rows);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAadhaarFormat();