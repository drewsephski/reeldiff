import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface UserCredits {
  credits: number;
  freeUsed: boolean;
  createdAt: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fingerprint } = req.query;

  if (!fingerprint || typeof fingerprint !== 'string') {
    return res.status(400).json({ error: 'fingerprint is required' });
  }

  try {
    const key = `user:${fingerprint}`;
    const userData = await kv.get<UserCredits>(key);

    if (!userData) {
      // New user - return default with free credit available
      return res.status(200).json({
        credits: 0,
        freeUsed: false,
      });
    }

    return res.status(200).json({
      credits: userData.credits,
      freeUsed: userData.freeUsed,
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return res.status(500).json({ error: 'Failed to fetch credits' });
  }
}
