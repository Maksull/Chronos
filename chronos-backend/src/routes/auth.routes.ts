import { FastifyInstance } from 'fastify';
import { authenticateToken } from '@/middlewares/auth.middleware';
import { ChangeEmailDto, ChangePasswordDto } from '@/types/auth';
import { AuthController } from '@/controllers';

const registerSchema = {
    body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: { type: 'string', minLength: 3, maxLength: 30 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            fullName: { type: 'string', nullable: true },
            region: { type: 'string', nullable: true },
        },
    },
} as const;

const loginSchema = {
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string' },
            password: { type: 'string' },
        },
    },
} as const;

const changePasswordSchema = {
    body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
            currentPassword: { type: 'string', minLength: 8 },
            newPassword: { type: 'string', minLength: 8 },
        },
    },
} as const;

const changeEmailSchema = {
    body: {
        type: 'object',
        required: ['password', 'newEmail'],
        properties: {
            password: { type: 'string' },
            newEmail: { type: 'string', format: 'email' },
        },
    },
} as const;

const verifyEmailSchema = {
    body: {
        type: 'object',
        required: ['code'],
        properties: {
            code: {
                type: 'string',
                pattern: '^[0-9]{6}$',
            },
        },
    },
} as const;

const checkResetTokeSchema = {
    body: {
        type: 'object',
        required: ['token'],
        properties: {
            token: { type: 'string' },
        },
    },
} as const;

const resetPasswordWithTokenSchema = {
    body: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
            token: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
        },
    },
} as const;

const resendVerificationCodeSchema = {
    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email' },
        },
    },
} as const;

const resendResetPasswordTokenSchema = {
    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email' },
        },
    },
} as const;

export async function authRoutes(app: FastifyInstance) {
    const authController = new AuthController();

    app.post('/auth/register', { schema: registerSchema }, authController.register.bind(authController));

    app.post('/auth/login', { schema: loginSchema }, authController.login.bind(authController));

    app.post(
        '/auth/logout',
        {
            preHandler: [authenticateToken],
        },
        authController.logout.bind(authController),
    );

    app.post('/auth/verify-email', { schema: verifyEmailSchema }, authController.verifyEmail.bind(authController));

    app.post('/auth/resend-verification-code', { schema: resendVerificationCodeSchema }, authController.resendVerificationCode.bind(authController));

    app.post('/auth/verify-email-change', { schema: verifyEmailSchema }, authController.confirmEmailChange.bind(authController));

    app.post('/auth/reset-password', authController.resetPassword.bind(authController));

    app.post('/auth/resend-reset-password-token', { schema: resendResetPasswordTokenSchema }, authController.resendResetPasswordToken.bind(authController));

    app.post('/auth/reset-password-with-token', { schema: resetPasswordWithTokenSchema }, authController.resetPasswordWithToken.bind(authController));

    app.post('/auth/check-reset-token', { schema: checkResetTokeSchema }, authController.checkResetToken.bind(authController));

    app.put<{
        Body: ChangePasswordDto;
    }>(
        '/auth/change-password',
        {
            schema: changePasswordSchema,
            preHandler: [authenticateToken],
        },
        authController.changePassword.bind(authController),
    );

    app.post<{
        Body: ChangeEmailDto;
    }>(
        '/auth/change-email',
        {
            schema: changeEmailSchema,
            preHandler: [authenticateToken],
        },
        authController.initiateEmailChange.bind(authController),
    );

    app.get('/auth/verify', {
        preHandler: authenticateToken,
        handler: async (_request, reply) => {
            // If we get here, the token is valid (middleware passed)
            return reply.send({ status: 'success' });
        },
    });
}
