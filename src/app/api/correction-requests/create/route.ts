import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      aadhaar_number,
      mobile_number,
      name,
      name_hindi,
      gender,
      dob,
      age,
      email,
      npr_receipt,
      co,
      co_hindi,
      house_no,
      house_no_hindi,
      street,
      street_hindi,
      landmark,
      landmark_hindi,
      area,
      area_hindi,
      city,
      city_hindi,
      post_office,
      post_office_hindi,
      district,
      district_hindi,
      sub_district,
      sub_district_hindi,
      state,
      state_hindi,
      pin_code,
      head_of_family_name,
      head_of_family_name_hindi,
      relationship,
      relationship_hindi,
      relative_aadhaar,
      relative_contact,
      same_address,
      dob_proof_type,
      identity_proof_type,
      address_proof_type,
      por_document_type,
      appointment_id,
      residential_status
    } = body;

    // Validate required fields
    if (!aadhaar_number || !mobile_number || !name || !gender || !dob || !street || !area || !city || !district || !state || !pin_code || !head_of_family_name || !relationship) {
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
        aadhaar_number, mobile_number, name, gender, dob, email,
        co, house_no, street, landmark, area, city, post_office, district, sub_district, state, pin_code,
        user_id, name_hindi, age, npr_receipt, co_hindi, house_no_hindi, street_hindi, landmark_hindi,
        area_hindi, city_hindi, post_office_hindi, district_hindi, sub_district_hindi, state_hindi,
        head_of_family_name, head_of_family_name_hindi, relationship, relationship_hindi,
        relative_aadhaar, relative_contact, same_address,
        dob_proof_type, identity_proof_type, address_proof_type, por_document_type,
        appointment_id, residential_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36,
        $37, $38, $39, $40, $41, $42, $43, $44
      )
      RETURNING id, aadhaar_number, status, created_at`,
      [
        aadhaar_number, mobile_number, name, gender, dob, email,
        co, house_no, street, landmark, area, city, post_office, district, sub_district, state, pin_code,
        session.user.id, name_hindi, age, npr_receipt, co_hindi, house_no_hindi, street_hindi, landmark_hindi,
        area_hindi, city_hindi, post_office_hindi, district_hindi, sub_district_hindi, state_hindi,
        head_of_family_name, head_of_family_name_hindi, relationship, relationship_hindi,
        relative_aadhaar, relative_contact, same_address,
        dob_proof_type, identity_proof_type, address_proof_type, por_document_type,
        appointment_id, residential_status
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