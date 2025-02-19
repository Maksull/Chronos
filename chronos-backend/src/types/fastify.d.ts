import { JwtPayload } from './auth';

declare module 'fastify' {
    interface FastifyRequest {
        user?: JwtPayload;
    }
}
