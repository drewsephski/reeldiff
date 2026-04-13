import type { VideoScript, RepoVideoScript } from '../types';

export async function analyzePR(
  prUrl: string,
  getToken: () => Promise<string | null>
): Promise<VideoScript> {
  let response: Response;
  const token = await getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prUrl }),
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

export async function analyzeRepo(
  repoUrl: string,
  getToken: () => Promise<string | null>
): Promise<RepoVideoScript> {
  let response: Response;
  const token = await getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    response = await fetch('/api/analyze-repo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ repoUrl }),
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
