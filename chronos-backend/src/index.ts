// src/index.ts
import 'reflect-metadata';
import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import { AppDataSource } from './database/data-source.js';

const app: FastifyInstance = fastify({
    logger: true,
});

// Register routes
app.get('/', async (request, reply) => {
    return { message: 'Hello, Fastify!' };
});

const start = async () => {
    try {
        // Initialize TypeORM
        await AppDataSource.initialize();
        console.log('Database connection has been established successfully.');

        // Start Fastify server
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
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
