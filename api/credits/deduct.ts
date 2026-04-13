import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuth } from '@clerk/nextjs/server';
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
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
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
