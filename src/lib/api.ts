import type { VideoScript, RepoVideoScript } from '../types';
import { getDeviceFingerprint } from './fingerprint';

export async function analyzePR(prUrl: string): Promise<VideoScript> {
  let response: Response;
  const fingerprint = getDeviceFingerprint();

  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prUrl, fingerprint }),
    });
  } catch {
    throw new Error('Network error - please check your connection');
  }

  if (!response.ok) {
    let errorMessage = 'Failed to analyze PR';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      // Response wasn't valid JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Invalid response from server');
  }
}

export async function analyzeRepo(repoUrl: string): Promise<RepoVideoScript> {
  let response: Response;
  const fingerprint = getDeviceFingerprint();

  try {
    response = await fetch('/api/analyze-repo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, fingerprint }),
    });
  } catch {
    throw new Error('Network error - please check your connection');
  }

  if (!response.ok) {
    let errorMessage = 'Failed to analyze repository';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Invalid response from server');
  }
}
