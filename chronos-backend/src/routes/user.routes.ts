import { FastifyInstance } from 'fastify';
import { authenticateToken } from '@/middlewares/auth.middleware';
import { UpdateProfileDto } from '@/types/user';
import { UserController } from '@/controllers';

const updateProfileSchema = {
    body: {
        type: 'object',
        properties: {
            fullName: { type: 'string', nullable: true },
            region: { type: 'string', nullable: true },
        },
    },
} as const;

export async function userRoutes(app: FastifyInstance) {
    const userController = new UserController();

    app.get('/users/profile', { preHandler: [authenticateToken] }, userController.getProfile.bind(userController));

    app.put<{ Body: UpdateProfileDto }>(
        '/users/profile',
        { schema: updateProfileSchema, preHandler: [authenticateToken] },
        userController.updateProfile.bind(userController),
    );
}
