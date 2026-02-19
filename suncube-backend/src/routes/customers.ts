import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { TelemetryQuerySchema } from '../validators/schemas';

export default async function customerRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', fastify.authenticate);

  // Helper to ensure user can access customer data
  const ensureAccess = async (customerId: string, userId: string, role: string) => {
    if (role === 'admin' || role === 'technician') return;
    const customer = await fastify.db('customers').where({ id: customerId, user_id: userId }).first();
    if (!customer) throw new Error('Unauthorized access to customer data');
  };

  // Summary
  app.get('/:customerId/summary', async (req: any, reply) => {
    const { customerId } = req.params;
    await ensureAccess(customerId, req.user.id, req.user.role);

    const now = new Date();
    const result = await fastify.db.raw(
      `SELECT * FROM get_customer_monthly_summary(?, ?, ?)`,
      [customerId, now.getFullYear(), now.getMonth() + 1]
    );

    return result.rows[0];
  });

  // Telemetry
  app.get('/:customerId/telemetry', { schema: { querystring: TelemetryQuerySchema } }, async (req: any, reply) => {
    const { customerId } = req.params;
    await ensureAccess(customerId, req.user.id, req.user.role);
    const { inverterId, from, to } = req.query;

    const query = fastify.db('telemetry')
      .join('inverters', 'telemetry.inverter_id', 'inverters.id')
      .where('inverters.customer_id', customerId)
      .select('telemetry.ts', 'telemetry.power_kw');

    if (inverterId) query.where('telemetry.inverter_id', inverterId);
    if (from) query.where('ts', '>=', from);
    if (to) query.where('ts', '<=', to);

    return query.orderBy('ts', 'desc').limit(1000);
  });

  // Inverters
  app.get('/:customerId/inverters', async (req: any, reply) => {
    const { customerId } = req.params;
    await ensureAccess(customerId, req.user.id, req.user.role);
    return fastify.db('inverters').where({ customer_id: customerId });
  });

  // Alerts
  app.get('/:customerId/alerts', async (req: any, reply) => {
    const { customerId } = req.params;
    await ensureAccess(customerId, req.user.id, req.user.role);
    return fastify.db('alerts').where({ customer_id: customerId }).orderBy('created_at', 'desc').limit(50);
  });
}
