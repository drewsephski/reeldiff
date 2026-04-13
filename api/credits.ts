import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '@clerk/backend';
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
