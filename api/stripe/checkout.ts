import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '@clerk/backend';
import Stripe from 'stripe';
import { getOrCreateStripeCustomer } from '../lib/stripe-sync.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

/**
 * POST /api/stripe/checkout
 * Create Stripe checkout session for credit purchase (requires Clerk auth)
 * Following STRIPE.md pattern - always create customer before checkout
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the Clerk token
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user info from Clerk (we need email)
    // In production, fetch from Clerk API or include in request body
    const { tier, email } = req.body;

    if (!tier || !['starter', 'pro'].includes(tier)) {
      return res.status(400).json({ error: 'tier must be "starter" or "pro"' });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'email is required' });
    }

    const priceId = tier === 'starter'
      ? process.env.PRICE_STARTER
      : process.env.PRICE_PRO;

    if (!priceId) {
      return res.status(500).json({ error: 'Price ID not configured' });
    }

    // STRIPE.md pattern: ALWAYS create customer before checkout
    const stripeCustomerId = await getOrCreateStripeCustomer(userId, email);

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/?canceled=true`,
      metadata: {
        userId,
        tier,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
