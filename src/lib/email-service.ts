import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_SECRET)

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

interface EmailResult {
  success: boolean
  error?: string
  data?: unknown
}

export class EmailService {
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Validate required parameters
      if (!options.to || !options.subject) {
        return { success: false, error: 'Missing required email parameters' }
      }

      if (!options.html && !options.text) {
        return { success: false, error: 'Email content (html or text) is required' }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(options.to)) {
        return { success: false, error: 'Invalid email address format' }
      }

      const emailParams: any = {
        from: process.env.EMAIL_FROM || 'noreply@ucl.test',
        to: options.to,
        subject: options.subject,
      }

      if (options.html) {
        emailParams.html = options.html
      } else if (options.text) {
        emailParams.text = options.text
      }

      console.log('Sending email via Resend:', {
        to: options.to,
        subject: options.subject,
        hasHtml: !!options.html,
        hasText: !!options.text
      })

      const result = await resend.emails.send(emailParams)

      if (result.error) {
        console.error('Resend API error:', result.error)
        return { success: false, error: result.error.message }
      }

      console.log('Email sent successfully:', result.data)
      return { success: true, data: result.data }
    } catch (error) {
      console.error('Email service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }

  async sendOTP(email: string, otp: string): Promise<EmailResult> {
    const subject = 'Your KYC Verification OTP'
    const text = `Your One-Time Password (OTP) for KYC verification is: ${otp}

This OTP will expire in 5 minutes.

Please do not share this OTP with anyone.

If you didn't request this OTP, please ignore this email.

Regards,
UCL Team`

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Logo -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #ff6b35;">
          <img src="https://i.ibb.co/jkPbSM8D/email-logo.png" alt="UCL Logo" style="max-width: 120px; height: auto; margin-bottom: 10px;">
          <h1 style="color: #333; margin: 0; font-size: 24px; font-weight: 600;">UCL - Update Client Letter</h1>
        </div>

        <!-- Email Content -->
        <div style="padding: 30px 20px;">
          <div style="background-color: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e9ecef; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px; text-align: center; font-weight: 600;">
              🔐 KYC Verification OTP
            </h2>

            <p style="margin: 0 0 20px 0; color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
              Your One-Time Password (OTP) for KYC verification is:
            </p>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 3px; margin: 20px 0; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              ${otp}
            </div>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                <strong>⏰ Important:</strong> This OTP will expire in <strong>5 minutes</strong>.<br>
                <strong>🔒 Security:</strong> Please do not share this OTP with anyone.<br>
                <strong>📱 One-time use:</strong> This OTP can only be used once.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e9ecef; padding-top: 20px;">
            <p style="margin: 0 0 10px 0;">
              <strong>Need help?</strong> Contact our support team
            </p>
            <p style="margin: 0; color: #888; font-size: 13px;">
              If you didn't request this OTP, please ignore this email or contact support immediately.
            </p>
            <div style="margin-top: 15px; padding: 10px; background-color: #ff6b35; color: white; border-radius: 6px; font-size: 13px;">
              <strong>UCL Team</strong> | Secure Identity Verification
            </div>
          </div>
        </div>
      </div>
    `

    return this.sendEmail({ to: email, subject, text, html })
  }

generateOTP(): string {
    // Generate cryptographically secure random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    return otp
  }

  // Add rate limiting support for OTP requests
  canSendOTP(lastSentAt: Date | null): boolean {
    if (!lastSentAt) return true

    const now = new Date()
    const timeSinceLastSend = now.getTime() - lastSentAt.getTime()
    const minInterval = 60 * 1000 // 1 minute between OTP requests

    return timeSinceLastSend > minInterval
  }
}

export const emailService = new EmailService()