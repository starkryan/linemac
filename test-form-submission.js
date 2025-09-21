// Test script for Aadhaar correction form submission
const testFormSubmission = async () => {
  const baseUrl = 'http://localhost:3000';
  let cookies = '';

  // Test data for form submission
  const formData = {
    aadhaar_number: '123456789012',
    mobile_number: '9876543210',
    name: 'Test User',
    name_hindi: 'टेस्ट यूजर',
    gender: 'male',
    dob: '1990-01-01',
    age: 34,
    email: 'test@example.com',
    npr_receipt: 'NPR123456',
    co: 'Father',
    co_hindi: 'पिता',
    house_no: '123',
    house_no_hindi: '१२३',
    street: 'Main Street',
    street_hindi: 'मुख्य सड़क',
    landmark: 'Near Temple',
    landmark_hindi: 'मंदिर के पास',
    area: 'Downtown',
    area_hindi: 'डाउनटाउन',
    city: 'Mumbai',
    city_hindi: 'मुंबई',
    post_office: 'PO123',
    post_office_hindi: 'पोस्ट ऑफिस१२३',
    district: 'Mumbai',
    district_hindi: 'मुंबई',
    sub_district: 'Mumbai Suburban',
    sub_district_hindi: 'मुंबई उपनगरीय',
    state: 'Maharashtra',
    state_hindi: 'महाराष्ट्र',
    pin_code: '400001',
    head_of_family_name: 'Father Name',
    head_of_family_name_hindi: 'पिता का नाम',
    relationship: 'son',
    relationship_hindi: 'पुत्र',
    relative_aadhaar: '123456789013',
    relative_contact: '9876543211',
    same_address: true,
    dob_proof_type: 'birth_certificate',
    identity_proof_type: 'pan_card',
    address_proof_type: 'passport',
    por_document_type: 'other',
    appointment_id: 'APT123456',
    residential_status: 'own'
  };

  console.log('🧪 Testing Aadhaar Correction Form Submission');
  console.log('='.repeat(50));

  try {
    // Step 1: Test login
    console.log('\n1️⃣ Testing Login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operatorUid: 'ADMIN001',
        operatorName: 'System Administrator',
        password: 'admin123'
      }),
      credentials: 'include'
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('📋 User data:', JSON.stringify(loginData, null, 2));

    // Extract cookies from login response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      cookies = setCookieHeader;
    }
    console.log('🍪 Session cookies extracted');

    // Step 2: Test balance check
    console.log('\n2️⃣ Testing Balance Check...');
    const balanceResponse = await fetch(`${baseUrl}/api/user/balance`, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    if (!balanceResponse.ok) {
      throw new Error(`Balance check failed: ${balanceResponse.status}`);
    }

    const balanceData = await balanceResponse.json();
    console.log('✅ Balance check successful');
    console.log('💰 Current balance:', balanceData);

    // Step 3: Test form validation (check if form page loads)
    console.log('\n3️⃣ Testing Form Page Access...');
    const formResponse = await fetch(`${baseUrl}/aadhaar-correction`, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    if (!formResponse.ok) {
      throw new Error(`Form page access failed: ${formResponse.status}`);
    }
    console.log('✅ Form page accessible');

    // Step 4: Test form submission
    console.log('\n4️⃣ Testing Form Submission...');
    const submitResponse = await fetch(`${baseUrl}/api/correction-requests/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify(formData)
    });

    console.log('📋 Submission response status:', submitResponse.status);

    const submitData = await submitResponse.json();
    console.log('📋 Submission response:', JSON.stringify(submitData, null, 2));

    if (submitResponse.ok) {
      console.log('✅ Form submission successful');

      // Step 5: Verify balance deduction
      console.log('\n5️⃣ Verifying Balance Deduction...');
      const finalBalanceResponse = await fetch(`${baseUrl}/api/user/balance`, {
        method: 'GET',
        headers: {
          'Cookie': cookies
        }
      });

      if (finalBalanceResponse.ok) {
        const finalBalanceData = await finalBalanceResponse.json();
        console.log('💰 Final balance:', finalBalanceData);

        const expectedBalance = balanceData.balance - 100;
        if (Math.abs(finalBalanceData.balance - expectedBalance) < 0.01) {
          console.log('✅ Balance deduction verified');
        } else {
          console.log('⚠️  Balance deduction may not have worked correctly');
        }
      }
    } else {
      console.log('❌ Form submission failed');
    }

    console.log('\n🎉 Form submission test completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Run the test
testFormSubmission();