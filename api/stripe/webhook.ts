import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { kv } from '@vercel/kv';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

interface UserCredits {
  credits: number;
  freeUsed: boolean;
  createdAt: string;
}

const CREDITS_BY_TIER: Record<string, number> = {
  starter: 5,
  pro: 20,
};

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

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const fingerprint = session.metadata?.fingerprint;
    const tier = session.metadata?.tier;

    if (!fingerprint || !tier) {
      console.error('Missing metadata in session:', session.id);
      return res.status(400).json({ error: 'Missing metadata' });
    }

    const creditsToAdd = CREDITS_BY_TIER[tier];
    if (!creditsToAdd) {
      console.error('Unknown tier:', tier);
      return res.status(400).json({ error: 'Unknown tier' });
    }

    try {
      const key = `user:${fingerprint}`;
      const userData = await kv.get<UserCredits>(key);

      if (userData) {
        // Update existing user
        userData.credits += creditsToAdd;
        await kv.set(key, userData);
      } else {
        // Create new user with credits
        const newUser: UserCredits = {
          credits: creditsToAdd,
          freeUsed: false,
          createdAt: new Date().toISOString(),
        };
        await kv.set(key, newUser);
      }

      // Store purchase record
      const purchaseKey = `purchase:${session.payment_intent}`;
      await kv.set(purchaseKey, {
        fingerprint,
        tier,
        credits: creditsToAdd,
        amount: session.amount_total,
        createdAt: new Date().toISOString(),
      });

      console.log(`Added ${creditsToAdd} credits to ${fingerprint}`);
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error adding credits:', error);
      return res.status(500).json({ error: 'Failed to add credits' });
    }
  }

  // Acknowledge other events
  return res.status(200).json({ received: true });
}
