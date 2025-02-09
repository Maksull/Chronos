import fastify, { FastifyInstance } from 'fastify';

const app: FastifyInstance = fastify();

app.get('/', async (request, reply) => {
    return { message: 'Hello, Fastify!' };
});

app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
