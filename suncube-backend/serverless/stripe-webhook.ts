import { Handler } from 'aws-lambda';
// import Stripe from 'stripe'; 

// TODO: Initialize Stripe with env secret
// const stripe = new Stripe(process.env.STRIPE_SECRET!);

export const handler: Handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let eventData;

  try {
    // verify signature
    // eventData = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    eventData = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: 'Webhook Error' };
  }

  // Handle idempotency and logic
  console.log('Processed Stripe Event', eventData.id);

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
