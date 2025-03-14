import { emailConfig } from '@/config/email';

export class EmailService {
  async sendVerificationEmail(email: string, code: string) {
    await emailConfig.transport.sendMail({
      from: emailConfig.from,
      to: email,
      subject: 'Verify your email address',
      html: `
          <h1>Welcome to ${process.env.APP_NAME || 'Chronos'}!</h1>
          <p>Your verification code is:</p>
          <h2 style="font-size: 32px; letter-spacing: 5px; background-color: #f4f4f4; padding: 20px; text-align: center;">
            ${code}
          </h2>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        `,
    });
  }

  async sendEmailChangeVerification(email: string, code: string) {
    await emailConfig.transport.sendMail({
      from: emailConfig.from,
      to: email,
      subject: 'Verify your new email address',
      html: `
          <h1>Email Change Request</h1>
          <p>Your verification code for email change is:</p>
          <h2 style="font-size: 32px; letter-spacing: 5px; background-color: #f4f4f4; padding: 20px; text-align: center;">
            ${code}
          </h2>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this change, please ignore this email.</p>
        `,
    });
  }
  async sendResetPasswordEmail(email: string, token: string) {
    await emailConfig.transport.sendMail({
      from: emailConfig.from,
      to: email,
      subject: 'Reset your password',
      html: `
              <h1>Reset your password</h1>
              <p>You recently requested to reset your password for your account.</p>
              <p>To reset your password, please use the following code:</p>
              <h2 style="font-size: 32px; letter-spacing: 5px; background-color: #f4f4f4; padding: 20px; text-align: center;">
                  ${token}
              </h2>
              <p>This token will expire in 15 minutes.</p>
              <p>If you did not request a password reset, please ignore this email.</p>
          `,
    });
  }
}
