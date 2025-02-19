import { FastifyInstance } from 'fastify';
import { AuthController } from '@/controllers/auth.controller';
import { authenticateToken } from '@/middlewares/auth.middleware';
import { ChangeEmailDto, ChangePasswordDto } from '@/types/auth';

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
};

const loginSchema = {
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string' },
            password: { type: 'string' },
        },
    },
};

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

export async function authRoutes(app: FastifyInstance) {
    const authController = new AuthController();

    app.post('/auth/register', { schema: registerSchema }, authController.register.bind(authController));

    app.post('/auth/login', { schema: loginSchema }, authController.login.bind(authController));

    app.get(
        '/auth/verify-email',
        {
            schema: {
                querystring: {
                    type: 'object',
                    required: ['token'],
                    properties: {
                        token: { type: 'string' },
                    },
                },
            },
        },
        authController.verifyEmail.bind(authController),
    );

    app.post(
        '/auth/resend-verification',
        {
            preHandler: [authenticateToken],
        },
        authController.resendVerification.bind(authController),
    );

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

    app.get<{
        Querystring: { token: string };
    }>(
        '/auth/verify-email-change',
        {
            schema: {
                querystring: {
                    type: 'object',
                    required: ['token'],
                    properties: {
                        token: { type: 'string' },
                    },
                },
            },
        },
        authController.confirmEmailChange.bind(authController),
    );
}
