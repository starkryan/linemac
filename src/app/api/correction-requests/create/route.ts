import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.handler(new Request(request.url));
    const sessionData = await session.json();

    if (!sessionData.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    if (!aadhaar_number || !mobile_number || !name || !gender || !dob || !street || !area || !city || !district || !state || !pin_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate Aadhaar number format (12 digits)
    if (!/^\d{12}$/.test(aadhaar_number)) {
      return NextResponse.json({ error: 'Invalid Aadhaar number format' }, { status: 400 });
    }

    // Validate mobile number format (10 digits)
    if (!/^\d{10}$/.test(mobile_number)) {
      return NextResponse.json({ error: 'Invalid mobile number format' }, { status: 400 });
    }

    // Validate PIN code format (6 digits)
    if (!/^\d{6}$/.test(pin_code)) {
      return NextResponse.json({ error: 'Invalid PIN code format' }, { status: 400 });
    }

    // Insert correction request
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
        sessionData.user.id
      ]
    );

    const newRequest = result.rows[0];

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: 'Correction request submitted successfully'
    });

  } catch (error) {
    console.error('Error creating correction request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}