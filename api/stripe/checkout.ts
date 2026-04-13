import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fingerprint, tier } = req.body;

  if (!fingerprint || typeof fingerprint !== 'string') {
    return res.status(400).json({ error: 'fingerprint is required' });
  }

  if (!tier || !['starter', 'pro'].includes(tier)) {
    return res.status(400).json({ error: 'tier must be "starter" or "pro"' });
  }

  const priceId = tier === 'starter'
    ? process.env.PRICE_STARTER
    : process.env.PRICE_PRO;

  if (!priceId) {
    return res.status(500).json({ error: 'Price ID not configured' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/?success=true&tier=${tier}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/?canceled=true`,
      metadata: {
        fingerprint,
        tier,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
