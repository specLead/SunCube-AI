import { FastifyInstance } from 'fastify';

export default async function meRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/', async (req, reply) => {
    const user = await fastify.db('users').where({ id: req.user.id }).first();
    if (!user) return reply.status(404).send({ error: 'User not found' });
    const { password_hash, ...profile } = user;
    return profile;
  });
}
