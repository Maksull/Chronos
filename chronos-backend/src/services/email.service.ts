import { emailConfig } from '@/config/email';

export class EmailService {
    async sendVerificationEmail(email: string, token: string) {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

        await emailConfig.transport.sendMail({
            from: emailConfig.from,
            to: email,
            subject: 'Verify your email address',
            html: `
                <h1>Welcome to ${process.env.APP_NAME || 'Chronos'}!</h1>
                <p>Please click the button below to verify your email address:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
                    Verify Email
                </a>
                <p>Or copy and paste this URL into your browser:</p>
                <p>${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
            `,
        });
    }

    async sendEmailChangeVerification(email: string, token: string) {
        const verificationUrl = `${process.env.APP_URL}/verify-email-change?token=${token}`;

        await emailConfig.transport.sendMail({
            from: emailConfig.from,
            to: email,
            subject: 'Verify your new email address',
            html: `
                <h1>Email Change Request</h1>
                <p>Please click the button below to verify your new email address:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
                    Verify New Email
                </a>
                <p>Or copy and paste this URL into your browser:</p>
                <p>${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this change, please ignore this email.</p>
            `,
        });
    }
}
