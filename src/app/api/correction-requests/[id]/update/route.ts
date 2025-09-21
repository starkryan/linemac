import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth-server';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from database to verify admin role
    const userResult = await query(
      'SELECT role, aadhaar_number, name, email FROM "user" WHERE id = $1',
      [session.user.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userResult.rows[0];

    // Check if user has admin role
    if (userData.role !== 'admin') {
      return NextResponse.json({
        error: 'Unauthorized - Admin role required',
        userRole: userData.role
      }, { status: 401 });
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