const fs = require('fs');
const path = require('path');

// Test script to check KYC upload functionality
async function testKYCUpload() {
  console.log('🧪 Testing KYC Upload Functionality\n');

  // Check if Bunny CDN is configured
  const bunnyConfig = {
    storageZoneName: process.env.BUNNY_STORAGE_ZONE_NAME,
    accessKey: process.env.BUNNY_CDN_SECRET,
    region: process.env.BUNNY_CDN_REGION
  };

  console.log('📋 Bunny CDN Configuration:');
  console.log('  Storage Zone:', bunnyConfig.storageZoneName || 'NOT SET');
  console.log('  Access Key:', bunnyConfig.accessKey ? bunnyConfig.accessKey.substring(0, 8) + '...' : 'NOT SET');
  console.log('  Region:', bunnyConfig.region || 'default ( Falkenstein)');
  console.log('');

  // Check if test image exists
  const testImagePath = '/tmp/test.png';
  if (fs.existsSync(testImagePath)) {
    console.log('✅ Test image exists at:', testImagePath);
    const stats = fs.statSync(testImagePath);
    console.log('  Size:', stats.size, 'bytes');
    console.log('');
  } else {
    console.log('❌ Test image not found');
    return;
  }

  // Test Bunny CDN upload class
  console.log('🔧 Testing Bunny CDN Implementation:');

  // Mock the BunnyCDN class logic
  class BunnyCDN {
    constructor() {
      this.config = bunnyConfig;
    }

    getBaseUrl() {
      const hostname = this.config.region
        ? `${this.config.region}.storage.bunnycdn.com`
        : 'storage.bunnycdn.com';
      return `https://${hostname}/${this.config.storageZoneName}`;
    }

    async uploadFile(file, filename, contentType) {
      try {
        console.log('  📤 Upload attempt for:', filename);
        console.log('  📊 File size:', file.length, 'bytes');

        if (!this.config.accessKey || this.config.accessKey.length < 10) {
          throw new Error('Bunny CDN access key not properly configured');
        }

        const baseUrl = this.getBaseUrl();
        const url = `${baseUrl}/${filename}`;

        console.log('  🌐 Upload URL:', url);
        console.log('  🔑 Access Key configured:', this.config.accessKey.length >= 10);

        // Note: We can't actually test the upload without a real file and proper setup
        // but we can validate the configuration
        const cdnUrl = `https://${this.config.storageZoneName}.b-cdn.net/${filename}`;
        console.log('  ✅ Predicted CDN URL:', cdnUrl);

        return { success: true, url: cdnUrl };
      } catch (error) {
        console.log('  ❌ Error:', error.message);
        return { success: false, error: error.message };
      }
    }
  }

  // Test the upload logic
  const bunnyCDN = new BunnyCDN();
  const testFile = fs.readFileSync(testImagePath);
  const testFilename = `test/kyc-test-${Date.now()}.png`;

  const result = await bunnyCDN.uploadFile(testFile, testFilename, 'image/png');

  if (result.success) {
    console.log('✅ Bunny CDN configuration test passed');
    console.log('  📸 Generated URL would be:', result.url);
  } else {
    console.log('❌ Bunny CDN configuration test failed');
    console.log('  Error:', result.error);
  }

  console.log('\n🚀 To test the full functionality:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Login with default user (admin@ucl.test / admin123)');
  console.log('3. Go to profile page: http://localhost:3000/profile');
  console.log('4. Upload an image in the KYC Verification section');
  console.log('5. Check browser console for upload logs');
  console.log('6. Verify the image appears in the avatar preview');
}

// Run the test
testKYCUpload().catch(console.error);