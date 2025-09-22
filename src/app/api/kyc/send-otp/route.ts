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

    // Check rate limiting
    const lastOtpSent = user.kyc_otp_sent_at ? new Date(user.kyc_otp_sent_at) : null
    if (lastOtpSent && !emailService.canSendOTP(lastOtpSent)) {
      const timeUntilNext = Math.ceil((60 * 1000 - (Date.now() - lastOtpSent.getTime())) / 1000)
      return NextResponse.json({
        error: `Please wait ${timeUntilNext} seconds before requesting another OTP`
      }, { status: 429 })
    }

    // Check if user has a valid email
    if (!user.email) {
      return NextResponse.json({ error: 'No email address found for this user' }, { status: 400 })
    }

    const otp = emailService.generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    const sentAt = new Date()

    await query(
      `UPDATE "user"
       SET kyc_otp = $1, kyc_otp_expires_at = $2, kyc_otp_sent_at = $3, kyc_status = 'otp_sent'
       WHERE id = $4`,
      [otp, expiresAt, sentAt, userId]
    )

    console.log(`Sending OTP to ${user.email} for user ${userId}`)

    const emailResult = await emailService.sendOTP(user.email, otp)

    if (!emailResult.success) {
      // Revert OTP in database if email fails
      await query(
        `UPDATE "user"
         SET kyc_otp = NULL, kyc_otp_expires_at = NULL, kyc_otp_sent_at = NULL, kyc_status = 'photo_uploaded'
         WHERE id = $1`,
        [userId]
      )

      console.error('Failed to send OTP email:', emailResult.error)
      return NextResponse.json({ error: emailResult.error }, { status: 500 })
    }

    console.log(`OTP sent successfully to ${user.email}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      emailSentTo: user.email.substring(0, 3) + '***' + user.email.split('@')[1].substring(-3) // Show partial email for privacy
    })

  } catch (error) {
    console.error('Error sending KYC OTP:', error)
    return NextResponse.json({
      error: 'Failed to send OTP'
    }, { status: 500 })
  }
}