import { Queue } from 'bullmq';
import { config } from '../config';

// Redis connection setup
const connection = {
  url: config.redis.url
};

// Queue for heavy tasks like PDF generation
export const invoiceQueue = new Queue('invoices', { connection });

export async function enqueueInvoiceGeneration(paymentId: string) {
  await invoiceQueue.add('generate_pdf', { paymentId });
}
