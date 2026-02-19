import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { toCSV } from '../services/csv';
import { writeAuditLog } from '../services/audit';

const TransactionQuerySchema = z.object({
  range: z.enum(['7d', '30d', 'all']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50)
});

type TransactionQueryInput = z.infer<typeof TransactionQuerySchema>;

export default async function adminRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  
  app.addHook('onRequest', fastify.authenticate);
  // Note: Some of these might be accessible by customers for their own data, 
  // but we keep them under /admin for now as per previous structure, or use role checks inside.

  // Helper to build transaction query
  const buildTxQuery = (queryBuilder: any, filters: any) => {
     if (filters.range === '7d') {
        queryBuilder.where('created_at', '>=', fastify.db.raw("now() - interval '7 days'"));
     } else if (filters.range === '30d') {
        queryBuilder.where('created_at', '>=', fastify.db.raw("now() - interval '30 days'"));
     }

     if (filters.search) {
        queryBuilder.where(function(this: any) {
           this.where('id', 'ilike', `%${filters.search}%`)
             .orWhere('payout_tx_hash', 'ilike', `%${filters.search}%`) // from 001 schema
             .orWhere('transaction_hash', 'ilike', `%${filters.search}%`); // from 003 schema
        });
     }
  };

  // List Transactions (Filtered)
  app.get('/transactions', { schema: { querystring: TransactionQuerySchema } }, async (req, reply) => {
    const { range, search, page, limit } = req.query as TransactionQueryInput;
    
    // Determine scope based on role
    let query = fastify.db('payments').select('*');
    
    // If not admin, restrict to own data? 
    // For this demo, assuming admin access or specific customer context passed in headers/auth
    if (req.user.role === 'customer') {
       // Find customer_id for this user
       const customer = await fastify.db('customers').where({ user_id: req.user.id }).first();
       if (customer) {
          query = query.where({ customer_id: customer.id });
       }
    }

    buildTxQuery(query, { range, search });

    const rows = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return { rows };
  });

  // Export Transactions CSV
  app.get('/transactions/export', { schema: { querystring: TransactionQuerySchema } }, async (req, reply) => {
    const { range, search } = req.query as TransactionQueryInput;
    
    // Audit
    await writeAuditLog(fastify.db, req.user.id, 'EXPORT_TRANSACTIONS', 'payments', 'all', { range, search });

    let query = fastify.db('payments').select(
        'id', 'created_at', 'amount', 'status', 'units_sold_kwh', 'tariff_per_kwh', 'payout_tx_hash'
    );
    
    // Apply role filter (customer vs admin)
    if (req.user.role === 'customer') {
        const customer = await fastify.db('customers').where({ user_id: req.user.id }).first();
        if (customer) query = query.where({ customer_id: customer.id });
    }

    buildTxQuery(query, { range, search });
    
    const rows = await query.orderBy('created_at', 'desc').limit(1000); // Hard limit for CSV export
    const csv = toCSV(rows, ['id', 'created_at', 'amount', 'status', 'units_sold_kwh', 'tariff_per_kwh', 'payout_tx_hash']);

    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="transactions_export.csv"');
    return reply.send(csv);
  });

  // Export Ledger CSV
  app.get('/ledger/export', async (req, reply) => {
     // Admin only preferably
     if (req.user.role !== 'admin' && req.user.role !== 'technician') {
        return reply.status(403).send({ error: 'Unauthorized' });
     }

     await writeAuditLog(fastify.db, req.user.id, 'EXPORT_LEDGER', 'ledger', 'all');

     const rows = await fastify.db('ledger')
        .select('*')
        .orderBy('timestamp', 'desc')
        .limit(2000);
     
     const csv = toCSV(rows, ['tx_id', 'timestamp', 'data_hash', 'block_height', 'verified', 'network']);
     
     reply.header('Content-Type', 'text/csv');
     reply.header('Content-Disposition', 'attachment; filename="ledger_audit_log.csv"');
     return reply.send(csv);
  });
}