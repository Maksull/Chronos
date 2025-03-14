import { FastifyRequest, FastifyReply } from 'fastify';
import { UpdateProfileDto } from '@/types/user';
import { UserService } from '@/services';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async getProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = await this.userService.getUserProfile(request.user!.userId);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = user;
            return reply.send({ status: 'success', data: userWithoutPassword });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async updateProfile(request: FastifyRequest<{ Body: UpdateProfileDto }>, reply: FastifyReply) {
        try {
            const user = await this.userService.updateProfile(request.user!.userId, request.body);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = user;
            return reply.send({ status: 'success', data: userWithoutPassword });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }
}
