import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface UserCredits {
  credits: number;
  freeUsed: boolean;
  createdAt: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fingerprint } = req.body;

  if (!fingerprint || typeof fingerprint !== 'string') {
    return res.status(400).json({ error: 'fingerprint is required' });
  }

  try {
    const key = `user:${fingerprint}`;
    const userData = await kv.get<UserCredits>(key);

    // Initialize user if doesn't exist
    if (!userData) {
      const newUser: UserCredits = {
        credits: 0,
        freeUsed: true, // Use free credit
        createdAt: new Date().toISOString(),
      };
      await kv.set(key, newUser);
      return res.status(200).json({ success: true, remaining: 0, usedFree: true });
    }

    // Check if free credit available
    if (!userData.freeUsed) {
      userData.freeUsed = true;
      await kv.set(key, userData);
      return res.status(200).json({
        success: true,
        remaining: userData.credits,
        usedFree: true,
      });
    }

    // Check paid credits
    if (userData.credits <= 0) {
      return res.status(403).json({
        error: 'No credits remaining',
        code: 'INSUFFICIENT_CREDITS',
      });
    }

    // Deduct paid credit
    userData.credits -= 1;
    await kv.set(key, userData);

    return res.status(200).json({
      success: true,
      remaining: userData.credits,
      usedFree: false,
    });
  } catch (error) {
    console.error('Error deducting credit:', error);
    return res.status(500).json({ error: 'Failed to deduct credit' });
  }
}
