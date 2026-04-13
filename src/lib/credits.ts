import { getDeviceFingerprint } from './fingerprint';

export interface CreditInfo {
  credits: number;
  freeUsed: boolean;
}

export async function getCredits(): Promise<CreditInfo> {
  const fingerprint = getDeviceFingerprint();

  const response = await fetch(`/api/credits?fingerprint=${fingerprint}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch credits');
  }

  return response.json();
}

export async function deductCredit(): Promise<{ success: boolean; remaining: number }> {
  const fingerprint = getDeviceFingerprint();

  const response = await fetch('/api/credits/deduct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to deduct credit');
  }

  return response.json();
}

export function hasCredits(creditInfo: CreditInfo): boolean {
  return creditInfo.credits > 0 || !creditInfo.freeUsed;
}

export function getEffectiveCredits(creditInfo: CreditInfo): number {
  // If free credit not used, show 1 + purchased credits
  if (!creditInfo.freeUsed) {
    return creditInfo.credits + 1;
  }
  return creditInfo.credits;
}
