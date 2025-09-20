import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.handler(new Request(request.url));
    const sessionData = await session.json();

    if (!sessionData.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build WHERE clause based on filters
    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      whereClause = `WHERE status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // For regular users, only show their own requests
    if (sessionData.user.role !== 'admin') {
      if (whereClause) {
        whereClause += ` AND user_id = $${paramIndex}`;
      } else {
        whereClause = `WHERE user_id = $${paramIndex}`;
      }
      params.push(sessionData.user.id);
      paramIndex++;
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM correction_requests ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get requests with pagination
    const dataQuery = `
      SELECT
        cr.id, cr.aadhaar_number, cr.name, cr.status, cr.created_at,
        u.name as operator_name
      FROM correction_requests cr
      LEFT JOIN "user" u ON cr.user_id = u.id
      ${whereClause}
      ORDER BY cr.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await query(dataQuery, params);
    const requests = result.rows;

    return NextResponse.json({
      success: true,
      requests,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching correction requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}