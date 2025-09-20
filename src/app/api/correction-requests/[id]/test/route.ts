import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // For testing purposes - remove authentication for now
    console.log('Testing single request endpoint without authentication');

    const { id } = await context.params;

    // Get request details
    const result = await query(
      `SELECT
        cr.*,
        u.name as operator_name
      FROM correction_requests cr
      LEFT JOIN "user" u ON cr.user_id = u.id
      WHERE cr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const requestDetails = result.rows[0];

    return NextResponse.json({
      success: true,
      request: requestDetails
    });

  } catch (error) {
    console.error('Error fetching correction request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}