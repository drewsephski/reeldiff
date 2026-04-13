import { kv } from '@vercel/kv';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

// Credit packages
const CREDITS_BY_TIER: Record<string, number> = {
  starter: 5,
  pro: 20,
};

export interface UserCreditData {
  credits: number;
  freeUsed: boolean;
  stripeCustomerId?: string;
  lastSyncedAt?: string;
}

/**
 * Sync Stripe checkout data to KV
 * Following STRIPE.md pattern - sync on checkout.session.completed
 */
export async function syncStripeDataToKV(
  stripeCustomerId: string,
  userId: string
): Promise<UserCreditData> {
  // Get or create user data
  const userKey = `credits:user:${userId}`;
  const existingData = await kv.get<UserCreditData>(userKey);

  // Store/update the stripe customer mapping
  const mappingKey = `stripe:customer:${stripeCustomerId}`;
  await kv.set(mappingKey, { userId });

  const userData: UserCreditData = {
    credits: existingData?.credits || 0,
    freeUsed: existingData?.freeUsed ?? false,
    stripeCustomerId,
    lastSyncedAt: new Date().toISOString(),
  };

  await kv.set(userKey, userData);
  return userData;
}

/**
 * Add credits to user after successful purchase
 */
export async function addCredits(
  userId: string,
  tier: string
): Promise<UserCreditData> {
  const creditsToAdd = CREDITS_BY_TIER[tier];
  if (!creditsToAdd) {
    throw new Error(`Unknown tier: ${tier}`);
  }

  const userKey = `credits:user:${userId}`;
  const existingData = await kv.get<UserCreditData>(userKey);

  const userData: UserCreditData = {
    credits: (existingData?.credits || 0) + creditsToAdd,
    freeUsed: existingData?.freeUsed ?? false,
    stripeCustomerId: existingData?.stripeCustomerId,
    lastSyncedAt: new Date().toISOString(),
  };

  await kv.set(userKey, userData);
  return userData;
}

/**
 * Get or create user credit data
 */
export async function getUserCredits(userId: string): Promise<UserCreditData> {
  const userKey = `credits:user:${userId}`;
  const data = await kv.get<UserCreditData>(userKey);

  if (!data) {
    // New user - initialize with free credit available
    const newData: UserCreditData = {
      credits: 0,
      freeUsed: false,
    };
    await kv.set(userKey, newData);
    return newData;
  }

  return data;
}

/**
 * Check if user has credits (paid or free)
 */
export function hasCredits(data: UserCreditData): boolean {
  return data.credits > 0 || !data.freeUsed;
}

/**
 * Deduct credit for video generation
 */
export async function deductCredit(userId: string): Promise<UserCreditData> {
  const userKey = `credits:user:${userId}`;
  const data = await kv.get<UserCreditData>(userKey);

  if (!data) {
    // First time user - use free credit
    const newData: UserCreditData = {
      credits: 0,
      freeUsed: true,
    };
    await kv.set(userKey, newData);
    return newData;
  }

  // Check if free credit available
  if (!data.freeUsed) {
    data.freeUsed = true;
    data.lastSyncedAt = new Date().toISOString();
    await kv.set(userKey, data);
    return data;
  }

  // Check paid credits
  if (data.credits <= 0) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

  // Deduct paid credit
  data.credits -= 1;
  data.lastSyncedAt = new Date().toISOString();
  await kv.set(userKey, data);
  return data;
}

/**
 * Create or get Stripe customer for user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const userKey = `credits:user:${userId}`;
  const data = await kv.get<UserCreditData>(userKey);

  if (data?.stripeCustomerId) {
    return data.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  // Store the customer ID
  if (data) {
    data.stripeCustomerId = customer.id;
    await kv.set(userKey, data);
  } else {
    await kv.set(userKey, {
      credits: 0,
      freeUsed: false,
      stripeCustomerId: customer.id,
    });
  }

  // Store reverse mapping
  await kv.set(`stripe:customer:${customer.id}`, { userId });

  return customer.id;
}
