import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import dbPlugin from './plugins/db';
import authPlugin from './plugins/auth';
import s3Plugin from './plugins/s3';

// Routes
import authRoutes from './routes/auth';
import meRoutes from './routes/me';
import customerRoutes from './routes/customers';
import ticketRoutes from './routes/tickets';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhooks';
import chatRoutes from './routes/chat';
import telemetryRoutes from './routes/telemetry';

const buildApp = () => {
  const app = Fastify({ logger: true });

  // Security & Validation
  app.register(helmet);
  app.register(cors, { origin: '*' }); // TODO: Lock down in prod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Core Plugins
  app.register(dbPlugin);
  app.register(authPlugin);
  app.register(s3Plugin);

  // Routes
  app.register(authRoutes, { prefix: '/auth' });
  app.register(meRoutes, { prefix: '/me' });
  app.register(customerRoutes, { prefix: '/customers' });
  app.register(ticketRoutes, { prefix: '/tickets' });
  app.register(paymentRoutes, { prefix: '/payments' });
  app.register(adminRoutes, { prefix: '/admin' });
  app.register(webhookRoutes, { prefix: '/webhooks' });
  app.register(chatRoutes, { prefix: '/chat' });
  app.register(telemetryRoutes, { prefix: '/telemetry' });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
};

export default buildApp;
