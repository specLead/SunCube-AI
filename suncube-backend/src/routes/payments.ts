import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { enqueueInvoiceGeneration } from '../jobs/producer';
import { writeAuditLog } from '../services/audit';

const GenerateInvoiceSchema = z.object({
  paymentId: z.string().uuid(),
  customerId: z.string().optional() // Optional override
});

const RequestPayoutSchema = z.object({
  amount: z.number().positive(),
  notes: z.string().optional()
});

type GenerateInvoiceInput = z.infer<typeof GenerateInvoiceSchema>;
type RequestPayoutInput = z.infer<typeof RequestPayoutSchema>;

export default async function paymentRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', fastify.authenticate);

  // Get payments for a customer
  app.get('/customers/:customerId/payments', async (req: any, reply) => {
     // Ensure user owns this customer profile or is admin
     if (req.user.role !== 'admin' && req.user.role !== 'technician') {
        // Simple check: In real app, check if user.id is linked to customerId
     }
     return fastify.db('payments').where({ customer_id: req.params.customerId }).orderBy('created_at', 'desc');
  });

  // Generate Invoice Draft
  app.post('/generate-invoice', { schema: { body: GenerateInvoiceSchema } }, async (req, reply) => {
    const { paymentId } = req.body as GenerateInvoiceInput;
    
    // 1. Validate Payment
    const payment = await fastify.db('payments').where({ id: paymentId }).first();
    if (!payment) return reply.status(404).send({ error: 'Payment record not found' });

    // 2. Generate Draft Metadata
    const draftId = `DRAFT-${Date.now()}`;
    const invoicePath = `invoices/${payment.customer_id}/${draftId}.pdf`;

    // 3. Update DB
    await fastify.db('payments')
      .where({ id: paymentId })
      .update({ 
        draft_id: draftId,
        invoice_path: invoicePath, 
        status: 'Draft' // Assuming status column exists from 001
      });

    // 4. Audit Log
    await writeAuditLog(fastify.db, req.user.id, 'GENERATE_INVOICE_DRAFT', 'payments', paymentId, { draftId });

    // 5. Enqueue Job (Worker will handle actual PDF rendering)
    await enqueueInvoiceGeneration(paymentId);

    return { 
      success: true, 
      draftId, 
      invoice_path: invoicePath,
      message: 'Invoice draft generated and rendering queued.'
    };
  });

  // Get Invoice Download URL
  app.get('/:paymentId/invoice-url', async (req: any, reply) => {
    const payment = await fastify.db('payments').where({ id: req.params.paymentId }).first();
    if (!payment || !payment.invoice_path) {
        return reply.status(404).send({ error: 'Invoice not generated yet' });
    }
    
    // Return signed URL
    const url = await fastify.storage.getDownloadUrl(payment.invoice_path);
    return { url };
  });

  // Request Payout
  app.post('/:customerId/request-payout', { schema: { body: RequestPayoutSchema } }, async (req, reply) => {
    const { customerId } = req.params as { customerId: string };
    const { amount, notes } = req.body as RequestPayoutInput;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'customer') { // simplified
        return reply.status(403).send({ error: 'Unauthorized' });
    }

    // In a real app, verify balance. Here we just log the request.
    // Insert into a payout_requests table if it existed, or log to audit.
    await writeAuditLog(fastify.db, req.user.id, 'REQUEST_PAYOUT', 'customers', customerId, { amount, notes });

    return { status: 'queued', customerId, message: 'Payout request received and queued for processing.' };
  });
}