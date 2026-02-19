import fp from 'fastify-plugin';
import knex, { Knex } from 'knex';
import { FastifyInstance } from 'fastify';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyInstance {
    db: Knex;
  }
}

const dbPlugin = fp(async (fastify) => {
  const db = knex({
    client: 'pg',
    connection: config.db.connectionString,
    searchPath: ['public', 'public'],
  });

  fastify.decorate('db', db);

  fastify.addHook('onClose', async (instance) => {
    await instance.db.destroy();
  });
});

export default dbPlugin;