import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_SECRET)

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

export class EmailService {
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      // TEMPORARY: Mock email sending for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock email sent:', {
          to: options.to,
          subject: options.subject,
          hasHtml: !!options.html,
          hasText: !!options.text
        })
        return { success: true }
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

      const result = await resend.emails.send(emailParams)

      if (result.error) {
        return { success: false, error: result.error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }

  async sendOTP(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
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
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}

export const emailService = new EmailService()