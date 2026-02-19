import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

const IngestSchema = z.object({
  inverterId: z.string().uuid(),
  power: z.number(),
  voltage: z.number(),
  current: z.number().optional(),
  temp: z.number().optional(),
  timestamp: z.string().datetime().optional() // Defaults to now if missing
});

type IngestInput = z.infer<typeof IngestSchema>;

export default async function telemetryRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  
  // NOTE: This endpoint might be authenticated via a device-specific API key in a real scenario
  // For now, we reuse the standard auth or assume it's an internal ingestion service
  // app.addHook('onRequest', fastify.authenticate); 

  app.post('/ingest', { schema: { body: IngestSchema } }, async (req, reply) => {
    const { inverterId, power, voltage, current, temp, timestamp } = req.body as IngestInput;

    // Validate inverter exists
    const inverter = await fastify.db('inverters').where({ id: inverterId }).first();
    if (!inverter) {
        return reply.status(404).send({ error: 'Inverter not found' });
    }

    // Insert telemetry
    await fastify.db('telemetry').insert({
        inverter_id: inverterId,
        power_kw: power,
        voltage: voltage,
        current: current || 0,
        temp: temp || 25,
        ts: timestamp || new Date().toISOString(),
        payload: JSON.stringify(req.body)
    });

    return { success: true };
  });
}