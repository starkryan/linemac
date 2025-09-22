const fs = require('fs');
const path = require('path');

// Test script to test the actual KYC upload API endpoint
async function testAPIEndpoint() {
  console.log('🧪 Testing KYC Upload API Endpoint\n');

  // Check if we can make a request to the local server
  const baseUrl = 'http://localhost:3000';

  try {
    // Test if the server is running
    console.log('🔍 Checking if server is running...');
    const response = await fetch(`${baseUrl}/api/kyc/upload-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      console.log('✅ Server is running and requires authentication (expected)');
    } else {
      console.log('⚠️  Server response:', response.status, response.statusText);
    }

    // Check the API route file exists
    const apiRoutePath = path.join(__dirname, 'src/app/api/kyc/upload-photo/route.ts');
    if (fs.existsSync(apiRoutePath)) {
      console.log('✅ API route file exists:', apiRoutePath);
    } else {
      console.log('❌ API route file not found');
    }

    // Check the Bunny CDN implementation
    const bunnyPath = path.join(__dirname, 'src/lib/bunny-cdn.ts');
    if (fs.existsSync(bunnyPath)) {
      console.log('✅ Bunny CDN implementation exists:', bunnyPath);
    } else {
      console.log('❌ Bunny CDN implementation not found');
    }

    console.log('\n🚀 Manual Test Instructions:');
    console.log('1. Open browser and go to: http://localhost:3000');
    console.log('2. Login with admin@ucl.test / admin123');
    console.log('3. Go to profile page: http://localhost:3000/profile');
    console.log('4. In KYC Verification section, upload an image');
    console.log('5. Check browser console for logs like:');
    console.log('   - "Bunny CDN Upload:"');
    console.log('   - "Bunny CDN API Response:"');
    console.log('   - "Photo upload successful, URL: [URL]"');
    console.log('6. The image should appear in a circular avatar preview');
    console.log('7. Check that the URL format is: https://ucl-storage.b-cdn.net/kyc/[userId]/[timestamp].png');

    console.log('\n🔍 Debugging Tips:');
    console.log('- If upload fails, check browser console for errors');
    console.log('- Make sure Bunny CDN credentials are correct in .env');
    console.log('- Check network tab for the actual API request');
    console.log('- Verify the image appears in the avatar after upload');

  } catch (error) {
    console.log('❌ Could not connect to server at', baseUrl);
    console.log('   Make sure the development server is running: npm run dev');
  }
}

// Run the test
testAPIEndpoint().catch(console.error);