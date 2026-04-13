import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuth } from '@clerk/nextjs/server';
import { getUserCredits } from './lib/stripe-sync.js';

/**
 * GET /api/credits
 * Get current user's credit balance (requires Clerk auth)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userData = await getUserCredits(userId);

    return res.status(200).json({
      credits: userData.credits,
      freeUsed: userData.freeUsed,
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return res.status(500).json({ error: 'Failed to fetch credits' });
  }
}
