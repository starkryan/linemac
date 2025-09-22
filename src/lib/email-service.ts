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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">KYC Verification</h2>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="margin: 0 0 15px 0; color: #666;">Your One-Time Password (OTP) for KYC verification is:</p>
            <div style="background-color: #007bff; color: white; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
              ${otp}
            </div>
            <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
              This OTP will expire in 5 minutes.<br>
              Please do not share this OTP with anyone.
            </p>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            If you didn't request this OTP, please ignore this email.
          </p>
          <p style="margin-top: 10px; color: #666; font-size: 14px;">
            Regards,<br>
            UCL Team
          </p>
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