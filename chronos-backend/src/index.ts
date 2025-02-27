import 'reflect-metadata';
import 'dotenv/config';
import cors from '@fastify/cors';
import fastify, { FastifyInstance } from 'fastify';
import { AppDataSource } from './database/data-source.js';
import { authRoutes } from './routes/auth.routes';
import { calendarRoutes } from './routes/calendar.routes.js';
import { userRoutes } from './routes/user.routes.js';

const app: FastifyInstance = fastify({
    logger: true,
});

const start = async () => {
    try {
        // Register CORS plugin
        await app.register(cors, {
            origin: ['http://localhost:3000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization'],
        });

        // Register routes
        authRoutes(app);
        userRoutes(app);
        calendarRoutes(app);

        app.get('/', async (request, reply) => {
            return { message: 'Hello, Fastify!' };
        });

        // Initialize TypeORM
        await AppDataSource.initialize();
        console.log('Database connection has been established successfully.');

        // Start Fastify server
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
        const host = process.env.HOST || '127.0.0.1';

        await app.listen({ port, host });
        console.log(`Server is running at http://${host}:${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    try {
        await AppDataSource.destroy();
        await app.close();
        console.log('Server has been gracefully shutdown');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

start();
