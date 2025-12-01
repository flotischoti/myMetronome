import { Resend } from 'resend'

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
): Promise<{ success: boolean; error?: string }> {
  const resend = new Resend(process.env.RESEND_API_KEY)

  if (!process.env.RESEND_API_KEY || !process.env.WEBSITE_HOSTNAME) {
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const resetUrl = `${process.env.WEBSITE_HOSTNAME}/reset-password/confirm?token=${resetToken}`

    const result = await resend.emails.send({
      from: 'Password Reset <reset@auth.metronomes.xyz>',
      replyTo: 'hello@metronomes.xyz',
      to: email,
      subject: 'Password Reset - Metronomes',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your Metronomes account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Need help? Contact us at <a href="mailto:hello@metronomes.xyz">hello@metronomes.xyz</a>
        </p>
      `,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return { success: false, error: 'Failed to send email' }
    }

    console.log('Password reset email sent:', result.data?.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

export function isEmailValid(email: string) {
  const emailRegex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/
  if (!email) return false

  if (email.length > 254) return false

  var valid = emailRegex.test(email)
  if (!valid) return false

  // Further checking of some things regex can't handle
  var parts = email.split('@')
  if (parts[0].length > 64) return false

  var domainParts = parts[1].split('.')
  if (
    domainParts.some(function (part) {
      return part.length > 63
    })
  )
    return false

  return true
}
