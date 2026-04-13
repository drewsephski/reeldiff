import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '@clerk/backend';
import { deductCredit } from '../lib/stripe-sync.js';

/**
 * POST /api/credits/deduct
 * Deduct 1 credit from current user (requires Clerk auth)
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

    const userData = await deductCredit(userId);

    return res.status(200).json({
      success: true,
      remaining: userData.credits,
      freeUsed: userData.freeUsed,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'INSUFFICIENT_CREDITS') {
      return res.status(403).json({
        error: 'No credits remaining',
        code: 'INSUFFICIENT_CREDITS',
      });
    }
    console.error('Error deducting credit:', error);
    return res.status(500).json({ error: 'Failed to deduct credit' });
  }
}
