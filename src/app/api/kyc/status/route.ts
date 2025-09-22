import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's KYC status from database
    const result = await query(
      'SELECT kyc_status, kyc_photo_url FROM "user" WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const user = result.rows[0]

    // Determine KYC status
    let kycStatus = 'not_started'
    if (user.kyc_status === 'verified') {
      kycStatus = 'verified'
    } else if (user.kyc_photo_url) {
      kycStatus = 'photo_uploaded'
    }

    return NextResponse.json({
      success: true,
      kycStatus,
      kycPhotoUrl: user.kyc_photo_url
    })

  } catch (error) {
    console.error('KYC status check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check KYC status' },
      { status: 500 }
    )
  }
}