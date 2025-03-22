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

    async sendCalendarInviteEmail(email: string, calendarName: string, inviteUrl: string) {
        await emailConfig.transport.sendMail({
            from: emailConfig.from,
            to: email,
            subject: `You've been invited to join a calendar`,
            html: `
              <h1>Calendar Invitation</h1>
              <p>You've been invited to join the calendar: <strong>${calendarName}</strong></p>
              <p>Click the button below to accept this invitation:</p>
              <div style="text-align: center; margin: 25px 0;">
                  <a href="${inviteUrl}" 
                     style="background-color: #4a6fa5; 
                            color: white; 
                            padding: 12px 24px; 
                            text-decoration: none; 
                            border-radius: 4px; 
                            display: inline-block;
                            font-weight: bold;">
                      Accept Invitation
                  </a>
              </div>
              <p>Or copy and paste this URL into your browser:</p>
              <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all;">
                  ${inviteUrl}
              </p>
              <p><small>If you don't have an account, you'll need to sign up first.</small></p>
              <p><small>If you didn't expect this invitation, you can safely ignore this email.</small></p>
          `,
        });
    }
}
