import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { syncStripeDataToKV, addCredits } from '../lib/stripe-sync.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

/**
 * POST /api/stripe/sync
 * Manual sync endpoint for post-checkout (following STRIPE.md pattern)
 * Prevents race condition between webhook and user returning to app
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== 'complete') {
      return res.status(400).json({ error: 'Checkout not complete' });
    }

    // Verify this session belongs to current user
    if (session.metadata?.userId !== userId) {
      return res.status(403).json({ error: 'Session does not belong to user' });
    }

    const tier = session.metadata?.tier;
    const stripeCustomerId = session.customer as string;

    if (!tier || !stripeCustomerId) {
      return res.status(400).json({ error: 'Missing metadata' });
    }

    // STRIPE.md pattern: Sync data first
    await syncStripeDataToKV(stripeCustomerId, userId);

    // Add credits
    await addCredits(userId, tier);

    return res.status(200).json({
      success: true,
      tier,
      creditsAdded: tier === 'starter' ? 5 : 20,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: 'Failed to sync purchase' });
  }
}
