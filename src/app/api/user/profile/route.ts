import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile data
    const profileResult = await query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u.balance,
        cr.name as full_name,
        cr.gender,
        cr.dob as date_of_birth,
        cr.email as correction_email,
        cr.house_no as house,
        cr.street,
        cr.area as village,
        cr.city,
        cr.pin_code,
        cr.mobile_number as phone,
        cr.status,
        cr.created_at
       FROM "user" u
       LEFT JOIN correction_requests cr ON u.id = cr.user_id
       WHERE u.id = $1
       ORDER BY cr.created_at DESC
       LIMIT 1`,
      [session.user.id]
    )

    if (profileResult.rows.length === 0) {
      // Return default profile with only user table data
      const userResult = await query(
        'SELECT role FROM "user" WHERE id = $1',
        [session.user.id]
      );
      const userRole = userResult.rows[0]?.role || 'user';

      return NextResponse.json({
        fullName: session.user.name || '',
        email: session.user.email || '',
        role: userRole,
        balance: 0
      })
    }

    const profile = profileResult.rows[0]

    return NextResponse.json({
      fullName: profile.full_name || session.user.name || '',
      gender: profile.gender || '',
      dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : '',
      house: profile.house || '',
      street: profile.street || '',
      village: profile.village || '',
      city: profile.city || '',
      pinCode: profile.pin_code || '',
      email: session.user.email || '',
      phone: profile.phone || '',
      role: profile.role || 'user',
      balance: parseFloat(profile.balance) || 0,
      hasCorrectionData: true,
      correctionStatus: profile.status,
      correctionCreatedAt: profile.created_at
    })

  } catch (error) {
    console.error('Error fetching profile data:', error)
    return NextResponse.json({
      error: 'Failed to fetch profile data'
    }, { status: 500 })
  }
}