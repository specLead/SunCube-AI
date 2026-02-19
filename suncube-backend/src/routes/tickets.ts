import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { TicketCreateSchema } from '../validators/schemas';
import { writeAuditLog } from '../services/audit';

type TicketCreateInput = z.infer<typeof TicketCreateSchema>;

export default async function ticketRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', fastify.authenticate);

  app.post('/', { schema: { body: TicketCreateSchema } }, async (req, reply) => {
    const { subject, body, priority, inverterId } = req.body as TicketCreateInput;
    
    const customer = await fastify.db('customers').where({ user_id: req.user.id }).first();
    if (!customer && req.user.role === 'customer') {
      return reply.status(400).send({ error: 'No customer profile found' });
    }

    const [ticket] = await fastify.db('tickets').insert({
      customer_id: customer?.id,
      created_by: req.user.id,
      priority,
      subject,
      body,
      inverter_id: inverterId
    }).returning('*');

    await writeAuditLog(fastify.db, req.user.id, 'CREATE_TICKET', 'tickets', ticket.id);

    return ticket;
  });

  app.get('/:ticketId', async (req: any, reply) => {
    const { ticketId } = req.params;
    const ticket = await fastify.db('tickets').where({ id: ticketId }).first();
    return ticket;
  });
}
