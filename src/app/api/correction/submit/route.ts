import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Define a type for the form data for better type safety
interface CorrectionRequest {
  // Residential Status
  resident_type: string;
  appointment_id: string;

  // Personal Details
  name: string;
  name_hindi: string;
  gender: string;
  age: string;
  dob_day: string;
  dob_month: string;
  dob_year: string;
  npr_receipt: string;

  // Contact Details
  c_o: string;
  c_o_hindi: string;
  house: string;
  house_hindi: string;
  street: string;
  street_hindi: string;
  landmark: string;
  landmark_hindi: string;
  area: string;
  area_hindi: string;
  city: string;
  city_hindi: string;
  district: string;
  state: string;
  pin_code: string;
  post_office: string;
  mobile: string;
  email: string;

  // References
  references: Array<{
    name: string;
    relation: string;
    aadhaar: string;
    mobile: string;
  }>;

  // Document Uploads
  photo: string | null;
  identity_proof: string | null;
  address_proof: string | null;
  dob_proof: string | null;

  // Biometric
  fingerprints: {
    leftThumb: boolean;
    leftIndex: boolean;
    leftMiddle: boolean;
    leftRing: boolean;
    leftLittle: boolean;
    rightThumb: boolean;
    rightIndex: boolean;
    rightMiddle: boolean;
    rightRing: boolean;
    rightLittle: boolean;
  };
  iris: {
    left: boolean;
    right: boolean;
  };

  // Declaration
  declaration: boolean;
  verification: boolean;

  // Auth info
  user_id: string;
  user_email: string;
  user_name: string;
  submitted_at: string;

  status: 'pending' | 'approved' | 'rejected';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation (you can expand this with a library like Zod)
    if (!body.name || !body.user_id || !body.mobile) {
      return NextResponse.json(
        { error: 'Missing required fields: name, user_id, mobile' },
        { status: 400 }
      );
    }

    // Construct DOB from separate fields
    const dob = body.dob_year && body.dob_month && body.dob_day
      ? `${body.dob_year}-${body.dob_month.padStart(2, '0')}-${body.dob_day.padStart(2, '0')}`
      : null;

    // Map form data to existing database schema
    // Use the existing table structure but store additional data in JSON fields when needed
    const correctionData = {
      aadhaar_number: body.appointment_id || '000000000000', // Use appointment_id as aadhaar_number for now
      mobile_number: body.mobile ? body.mobile.replace(/\s/g, '') : '0000000000',
      name: body.name,
      gender: body.gender || 'other',
      dob: dob || '1970-01-01', // Default date if not provided
      email: body.email || null,
      co: body.c_o || null,
      house_no: body.house || null,
      street: body.street || 'Unknown', // Required field
      landmark: body.landmark || null,
      area: body.area || 'Unknown', // Required field
      city: body.city || 'Unknown', // Required field
      post_office: body.post_office || null,
      district: body.district || 'Unknown', // Required field
      sub_district: null, // Not in form data
      state: body.state || 'Unknown', // Required field
      pin_code: body.pin_code ? body.pin_code.replace(/\s/g, '') : '000000', // Required field
      user_id: body.user_id,
      status: 'pending',
    };

    const queryText = `
      INSERT INTO correction_requests (
        aadhaar_number, mobile_number, name, gender, dob, email, co, house_no, street,
        landmark, area, city, post_office, district, sub_district, state, pin_code,
        user_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id
    `;

    const values = [
      correctionData.aadhaar_number,
      correctionData.mobile_number,
      correctionData.name,
      correctionData.gender,
      correctionData.dob,
      correctionData.email,
      correctionData.co,
      correctionData.house_no,
      correctionData.street,
      correctionData.landmark,
      correctionData.area,
      correctionData.city,
      correctionData.post_office,
      correctionData.district,
      correctionData.sub_district,
      correctionData.state,
      correctionData.pin_code,
      correctionData.user_id,
      correctionData.status,
    ];

    const result = await query(queryText, values);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Failed to create correction request' },
        { status: 500 }
      );
    }

    const newRequestId = result.rows[0].id;

    return NextResponse.json(
      {
        message: 'Aadhaar correction request submitted successfully!',
        requestId: newRequestId,
        status: 'pending'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error submitting correction request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
