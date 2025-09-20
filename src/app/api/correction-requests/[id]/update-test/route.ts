import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // For testing purposes - remove authentication for now
    console.log('Testing update endpoint without authentication');

    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update request status
    const result = await query(
      'UPDATE correction_requests SET status = $1, updated_at = $2 WHERE id = $3 RETURNING id, status',
      [status, new Date().toISOString(), id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const updatedRequest = result.rows[0];

    return NextResponse.json({
      success: true,
      request: updatedRequest
    });

  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}