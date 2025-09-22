import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { otp } = await request.json()

    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 })
    }

    const userId = session.user.id

    const userResult = await query(
      `SELECT kyc_otp, kyc_otp_expires_at, kyc_photo_url, kyc_status FROM "user" WHERE id = $1`,
      [userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    if (!user.kyc_photo_url) {
      return NextResponse.json({ error: 'Please upload a photo first' }, { status: 400 })
    }

    if (!user.kyc_otp || !user.kyc_otp_expires_at) {
      return NextResponse.json({ error: 'No OTP request found. Please request a new OTP.' }, { status: 400 })
    }

    if (new Date() > new Date(user.kyc_otp_expires_at)) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new OTP.' }, { status: 400 })
    }

    if (user.kyc_otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    const verifiedAt = new Date()

    await query(
      `UPDATE "user"
       SET kyc_status = 'verified', kyc_verified_at = $1, kyc_otp = NULL, kyc_otp_expires_at = NULL
       WHERE id = $2`,
      [verifiedAt, userId]
    )

    return NextResponse.json({
      success: true,
      message: 'KYC verified successfully',
      verifiedAt: verifiedAt.toISOString()
    })

  } catch (error) {
    console.error('Error verifying KYC OTP:', error)
    return NextResponse.json({
      error: 'Failed to verify OTP'
    }, { status: 500 })
  }
}