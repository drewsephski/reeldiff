import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { generateText, Output } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { verifyToken } from '@clerk/backend';
import { getUserCredits, hasCredits as checkCredits } from './lib/stripe-sync.js';

config({ path: '.env.local' });

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const repoSummarySchema = z.object({
  headline: z.string().describe('A catchy, short headline (max 10 words) that captures what this repo does'),
  bullets: z.array(z.string()).min(3).max(5).describe('Key features or benefits (max 10 words each) explaining why this repo matters'),
  emoji: z.string().describe('A single emoji that represents this repo'),
  accentColor: z.string().describe('A hex color that matches the repo vibe (bright, playful colors work best, or use the primary language color)'),
  tone: z.enum(['celebratory', 'educational', 'hype', 'technical']).describe('celebratory for popular/widely-used repos, educational for learning resources, hype for new/exciting tech, technical for infrastructure/tools'),
});

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  // Match github.com/owner/repo (with optional trailing slash)
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\/|$)/);
  if (!match) return null;
  // Exclude pull request URLs
  if (url.includes('/pull/')) return null;
  return { owner: match[1], repo: match[2] };
}

async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { 
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return content.slice(0, 3000); // Truncate to avoid token limits
  } catch (err) {
    console.error('Error fetching README:', err);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

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

    const { repoUrl } = req.body;
    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({ error: 'repoUrl is required' });
    }

    // Check credits using Clerk userId
    const userData = await getUserCredits(userId);

    if (!checkCredits(userData)) {
      return res.status(403).json({
        error: 'No credits remaining. Please purchase more credits to continue.',
        code: 'INSUFFICIENT_CREDITS',
      });
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid repo URL format. Use: github.com/owner/repo' });
    }

    // Fetch repo data
    const repoApiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;
    console.log('Fetching repo:', repoApiUrl);

    const [repoRes, readmeContent] = await Promise.all([
      fetch(repoApiUrl, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      }),
      fetchReadme(parsed.owner, parsed.repo),
    ]);

    console.log('GitHub repo response status:', repoRes.status);

    if (!repoRes.ok) {
      const errorText = await repoRes.text();
      console.error('GitHub API error:', repoRes.status, errorText);
      return res.status(repoRes.status).json({ 
        error: repoRes.status === 404 ? 'Repository not found or is private' : `Failed to fetch repo: ${repoRes.status}` 
      });
    }

    const repo = await repoRes.json();

    const meta = {
      repoName: `${parsed.owner}/${parsed.repo}`,
      owner: parsed.owner,
      description: repo.description || '',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || 'Unknown',
      topics: repo.topics || [],
      ownerAvatar: repo.owner?.avatar_url || '',
    };

    // Generate AI summary
    const prompt = `Analyze this GitHub repository and generate a social media video summary.

Repository: ${parsed.owner}/${parsed.repo}
Description: ${repo.description || 'No description'}
Primary Language: ${repo.language || 'Unknown'}
Stars: ${repo.stargazers_count}
Forks: ${repo.forks_count}
Topics: ${(repo.topics || []).join(', ')}

${readmeContent ? `README Preview:
${readmeContent.slice(0, 2000)}` : 'No README available'}

Create an engaging video script that showcases what this repo does and why developers should care about it.`;

    // Use generateText with Output.object() for structured output
    console.log('Calling OpenRouter with model: google/gemini-3.1-flash-lite-preview');
    console.log('Prompt length:', prompt.length);

    let output;
    try {
      const result = await generateText({
        model: openrouter('google/gemini-3.1-flash-lite-preview'),
        output: Output.object({
          schema: repoSummarySchema,
        }),
        prompt,
        temperature: 0.7,
      });
      output = result.output;
      console.log('OpenRouter success:', output);
    } catch (aiError) {
      console.error('OpenRouter error:', aiError);
      throw aiError;
    }

    return res.status(200).json({
      meta,
      summary: {
        headline: output.headline,
        bullets: output.bullets,
        emoji: output.emoji,
      },
      style: {
        accentColor: output.accentColor,
        tone: output.tone,
      },
    });
  } catch (error: unknown) {
    console.error('Handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: errorMessage,
    });
  }
}
