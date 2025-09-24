import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from database since it's not in the session
    const userResult = await query(
      'SELECT role FROM "user" WHERE id = $1',
      [session.user.id]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParam = searchParams.get('q')?.trim();

    if (!queryParam) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const users = await query(
      `SELECT
        id, name, email, phone, balance, role, status, kyc_status
        FROM "user"
        WHERE
          LOWER(name) ILIKE $1 OR
          LOWER(email) ILIKE $1 OR
          phone ILIKE $1 OR
          aadhaar_number ILIKE $1
        ORDER BY
          CASE
            WHEN LOWER(email) = LOWER($2) THEN 1
            WHEN LOWER(name) = LOWER($2) THEN 2
            WHEN phone = $2 THEN 3
            ELSE 4
          END,
          "createdAt" DESC
        LIMIT 20`,
      [`%${queryParam}%`, queryParam]
    );

    return NextResponse.json({
      users: users.rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        balance: Number(user.balance),
        role: user.role,
        status: user.status,
        kycStatus: user.kyc_status,
      })),
    });

  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}