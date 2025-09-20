import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // For testing purposes - remove authentication for now
    console.log('Testing list endpoint without authentication');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let whereClause = '';
    let paramIndex = 1;
    const params = [];

    // Add status filter if provided
    if (status && status !== 'all') {
      whereClause = `WHERE cr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM correction_requests cr ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get requests with pagination
    const dataQuery = `
      SELECT
        cr.*,
        u.name as operator_name
      FROM correction_requests cr
      LEFT JOIN "user" u ON cr.user_id = u.id
      ${whereClause}
      ORDER BY cr.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const result = await query(dataQuery, params);

    return NextResponse.json({
      success: true,
      requests: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching correction requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}