import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireTechnician: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: config.jwt.secret,
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Cast request to any to avoid missing type definition for jwtVerify if types aren't loaded
      await (request as any).jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.user?.role !== 'admin') {
      reply.code(403).send({ error: 'Forbidden: Admins only' });
    }
  });

  fastify.decorate('requireTechnician', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!['admin', 'technician'].includes(request.user?.role)) {
      reply.code(403).send({ error: 'Forbidden: Technicians/Admins only' });
    }
  });
});