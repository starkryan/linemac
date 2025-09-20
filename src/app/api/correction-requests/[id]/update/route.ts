import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth-server';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await auth.handler(new Request(request.url));
    const sessionData = await session.json();

    if (!sessionData.user?.id || sessionData.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status, admin_notes } = body;

    // Validate status
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if request exists
    const existingRequest = await query(
      'SELECT * FROM correction_requests WHERE id = $1',
      [id]
    );

    if (existingRequest.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Update request status
    const result = await query(
      `UPDATE correction_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, aadhaar_number, name, status, updated_at`,
      [status, id]
    );

    const updatedRequest = result.rows[0];

    // TODO: Send notification to user about status change
    // This could be implemented with email notifications or in-app notifications

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Request ${status} successfully`
    });

  } catch (error) {
    console.error('Error updating correction request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}