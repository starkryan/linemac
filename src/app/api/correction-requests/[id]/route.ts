import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    // Check authentication
    const session = await auth.handler(new Request(request.url));
    const sessionData = await session.json();

    if (!sessionData.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Check if user has permission to view this request
    if (sessionData.user.role !== 'admin' && requestDetails.user_id !== sessionData.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      request: requestDetails
    });

  } catch (error) {
    console.error('Error fetching correction request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}