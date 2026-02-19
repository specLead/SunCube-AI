import { Worker } from 'bullmq';
import { config } from '../config';

const worker = new Worker('invoices', async job => {
  if (job.name === 'generate_pdf') {
    console.log(`Processing Invoice Generation for Payment ID: ${job.data.paymentId}`);
    // Simulate heavy work
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Invoice Generated for ${job.data.paymentId}`);
    // In real app: Update DB with S3 URL
  }
}, {
  connection: { url: config.redis.url }
});

worker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
