import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile data from user table (where profile data is saved)
    const profileResult = await query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u.balance,
        u.kyc_status,
        u.kyc_photo_url,
        u.kyc_verified_at,
        u.full_name,
        u.phone,
        u.address,
        u.gender,
        u.date_of_birth,
        u.house,
        u.street,
        u.village,
        u.city,
        u.pin_code,
        u.profile_completed,
        u.profile_submitted_at
       FROM "user" u
       WHERE u.id = $1`,
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
        balance: 0,
        profileCompleted: false,
        profileSubmittedAt: null
      })
    }

    const profile = profileResult.rows[0]

    return NextResponse.json({
      fullName: profile.full_name || session.user.name || '',
      gender: profile.gender || '',
      dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : '',
      house: profile.house || '',
      street: profile.street || '',
      village: profile.village || '',
      city: profile.city || '',
      pinCode: profile.pin_code || '',
      email: session.user.email || '',
      phone: profile.phone || '',
      role: profile.role || 'user',
      balance: parseFloat(profile.balance) || 0,
      hasCorrectionData: false,
      correctionStatus: null,
      correctionCreatedAt: null,
      kycStatus: profile.kyc_status || 'not_started',
      kycPhotoUrl: profile.kyc_photo_url || '',
      kycVerifiedAt: profile.kyc_verified_at || null,
      profileCompleted: profile.profile_completed || false,
      profileSubmittedAt: profile.profile_submitted_at || null
    })

  } catch (error) {
    console.error('Error fetching profile data:', error)
    return NextResponse.json({
      error: 'Failed to fetch profile data'
    }, { status: 500 })
  }
}