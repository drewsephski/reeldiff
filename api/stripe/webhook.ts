import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { addCredits, syncStripeDataToKV } from '../lib/stripe-sync.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// STRIPE.md: Events we track for credit purchases
const allowedEvents: Stripe.Event.Type[] = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
];

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhooks following STRIPE.md pattern
 * - Verify signature
 * - Process allowed events
 * - Sync data to KV
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  if (!sig || typeof sig !== 'string') {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // STRIPE.md pattern: Only process events we care about
  if (!allowedEvents.includes(event.type)) {
    return res.status(200).json({ received: true });
  }

  try {
    await processEvent(event);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Failed to process webhook' });
  }
}

async function processEvent(event: Stripe.Event): Promise<void> {
  // STRIPE.md: All events we track have customer info
  const session = event.data.object as Stripe.Checkout.Session;
  const stripeCustomerId = session.customer as string;

  if (typeof stripeCustomerId !== 'string') {
    throw new Error(`[STRIPE HOOK] Customer ID isn't string. Event type: ${event.type}`);
  }

  // Handle checkout.session.completed - add credits
  if (event.type === 'checkout.session.completed') {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;

    if (!userId || !tier) {
      throw new Error(`[STRIPE HOOK] Missing metadata in session: ${session.id}`);
    }

    // STRIPE.md pattern: Sync data first
    await syncStripeDataToKV(stripeCustomerId, userId);

    // Add credits to user
    await addCredits(userId, tier);

    console.log(`[STRIPE HOOK] Added credits for user ${userId}, tier ${tier}`);
  }

  // For other events, just sync the data
  // (in a subscription model we'd update status, but for credits we just need the purchase)
}

// Disable body parsing for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
