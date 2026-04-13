import { useAuth } from '@clerk/clerk-react';

export interface CreditInfo {
  credits: number;
  freeUsed: boolean;
}

/**
 * Hook to get auth token for API calls
 */
export function useAuthToken() {
  const { getToken } = useAuth();
  return async () => getToken();
}

/**
 * Fetch credits for current authenticated user
 */
export async function getCredits(getToken: () => Promise<string | null>): Promise<CreditInfo> {
  const token = await getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/credits', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch credits');
  }

  return response.json();
}

/**
 * Deduct 1 credit for video generation
 */
export async function deductCredit(getToken: () => Promise<string | null>): Promise<{ success: boolean; remaining: number }> {
  const token = await getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/credits/deduct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 403 && error.code === 'INSUFFICIENT_CREDITS') {
      throw new Error('INSUFFICIENT_CREDITS');
    }
    throw new Error(error.error || 'Failed to deduct credit');
  }

  return response.json();
}

/**
 * Check if user has any credits (paid or free)
 */
export function hasCredits(creditInfo: CreditInfo): boolean {
  return creditInfo.credits > 0 || !creditInfo.freeUsed;
}

/**
 * Get effective credit count (includes free credit if not used)
 */
export function getEffectiveCredits(creditInfo: CreditInfo): number {
  // If free credit not used, show 1 + purchased credits
  if (!creditInfo.freeUsed) {
    return creditInfo.credits + 1;
  }
  return creditInfo.credits;
}
