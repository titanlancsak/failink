import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.FROM_EMAIL || 'onboarding@resend.dev'
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${CLIENT_URL}/auth/verify?token=${token}`
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your Agora account',
    html: `
      <div style="font-family: serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 28px; margin-bottom: 8px;">Verify your account</h1>
        <p style="color: #5C5854; margin-bottom: 32px;">
          Click the button below to verify your email address.
          This link expires in 24 hours.
        </p>
        <a href="${link}"
           style="background: #0D0D0D; color: #F5F0E8; padding: 14px 32px;
                  text-decoration: none; font-size: 13px; letter-spacing: 2px;
                  text-transform: uppercase;">
          Verify Email
        </a>
        <p style="color: #8A8480; font-size: 12px; margin-top: 32px;">
          If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${CLIENT_URL}/auth/reset-password?token=${token}`
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your Agora password',
    html: `
      <div style="font-family: serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 28px; margin-bottom: 8px;">Reset your password</h1>
        <p style="color: #5C5854; margin-bottom: 32px;">
          Click the button below to reset your password.
          This link expires in 1 hour.
        </p>
        <a href="${link}"
           style="background: #0D0D0D; color: #F5F0E8; padding: 14px 32px;
                  text-decoration: none; font-size: 13px; letter-spacing: 2px;
                  text-transform: uppercase;">
          Reset Password
        </a>
        <p style="color: #8A8480; font-size: 12px; margin-top: 32px;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  })
}