import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { emailService } from '@/lib/email-service'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const userResult = await query(
      'SELECT kyc_photo_url, email, kyc_status FROM "user" WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    if (!user.kyc_photo_url) {
      return NextResponse.json({ error: 'Please upload a photo first' }, { status: 400 })
    }

    if (user.kyc_status === 'verified') {
      return NextResponse.json({ error: 'KYC already verified' }, { status: 400 })
    }

    const otp = emailService.generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await query(
      `UPDATE "user"
       SET kyc_otp = $1, kyc_otp_expires_at = $2, kyc_status = 'otp_sent'
       WHERE id = $3`,
      [otp, expiresAt, userId]
    )

    const emailResult = await emailService.sendOTP(user.email, otp)

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email'
    })

  } catch (error) {
    console.error('Error sending KYC OTP:', error)
    return NextResponse.json({
      error: 'Failed to send OTP'
    }, { status: 500 })
  }
}