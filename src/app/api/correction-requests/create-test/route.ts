import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // For testing purposes - remove authentication for now
    console.log('Testing form submission without authentication');

    const body = await request.json();
    const {
      aadhaar_number,
      mobile_number,
      name,
      gender,
      dob,
      email,
      co,
      house_no,
      street,
      landmark,
      area,
      city,
      post_office,
      district,
      sub_district,
      state,
      pin_code
    } = body;

    // Validate required fields
    if (!aadhaar_number || !mobile_number || !name || !gender || !dob || !email || !pin_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate Aadhaar number (12 digits)
    if (!/^\d{12}$/.test(aadhaar_number)) {
      return NextResponse.json({ error: 'Aadhaar number must be 12 digits' }, { status: 400 });
    }

    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(mobile_number)) {
      return NextResponse.json({ error: 'Mobile number must be 10 digits' }, { status: 400 });
    }

    // Validate PIN code (6 digits)
    if (!/^\d{6}$/.test(pin_code)) {
      return NextResponse.json({ error: 'PIN code must be 6 digits' }, { status: 400 });
    }

    // Insert correction request with a test user ID
    const result = await query(
      `INSERT INTO correction_requests (
        aadhaar_number, mobile_number, name, gender, dob, email, co, house_no,
        street, landmark, area, city, post_office, district, sub_district, state, pin_code,
        user_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'pending')
      RETURNING id, aadhaar_number, status, created_at`,
      [
        aadhaar_number, mobile_number, name, gender, dob, email, co, house_no,
        street, landmark, area, city, post_office, district, sub_district, state, pin_code,
        '899bfe1e-acbc-4604-895d-a9b0eecd97f6' // Using admin user ID for testing
      ]
    );

    const newRequest = result.rows[0];

    return NextResponse.json({
      success: true,
      request: newRequest
    });

  } catch (error) {
    console.error('Error creating correction request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}