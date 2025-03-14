import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@/types/auth';

export const TokenBlacklist: Set<string> = new Set();

export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return reply.status(401).send({
            status: 'error',
            message: 'Authentication required',
        });
    }

    if (TokenBlacklist.has(token)) {
        return reply.status(403).send({
            status: 'error',
            message: 'Token has been blacklisted',
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;

        request.user = payload;
    } catch {
        return reply.status(403).send({
            status: 'error',
            message: 'Invalid token',
        });
    }
}
