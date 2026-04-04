import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

config({ path: '.env.local' });

const RATE_LIMIT = 5;

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const summarySchema = z.object({
  headline: z.string().describe('A catchy, short headline (max 10 words) that captures the essence of this PR'),
  vibe: z.enum(['feature', 'fix', 'refactor', 'docs', 'chore']),
  bullets: z.array(z.string()).min(3).max(5).describe('Key points (max 10 words each) explaining what changed'),
  emoji: z.string().describe('A single emoji that represents this PR'),
  accentColor: z.string().describe('A hex color that matches the vibe (bright, playful colors work best)'),
  tone: z.enum(['celebratory', 'relief', 'technical', 'minor']).describe('celebratory for new features, relief for bug fixes, technical for refactors, minor for small changes'),
});

type OpenAISummary = z.infer<typeof summarySchema>;

function parsePrUrl(url: string): { owner: string; repo: string; number: number } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: parseInt(match[3], 10) };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting (skip if Redis is unavailable)
    if (redis) {
      try {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = typeof forwarded === 'string'
          ? forwarded.split(',')[0].trim()
          : req.socket?.remoteAddress ?? 'unknown';
        const key = `ratelimit:analyze:${ip}`;
        const count = await redis.get<number>(key) ?? 0;
        if (count >= RATE_LIMIT) {
          return res.status(429).json({ error: 'Rate limit exceeded. You can generate 5 videos per day.' });
        }
        const now = new Date();
        const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
        const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000);
        await redis.set(key, count + 1, { ex: ttl });
      } catch {
        // Redis unavailable — skip rate limiting
      }
    }

    const { prUrl } = req.body;
    if (!prUrl || typeof prUrl !== 'string') {
      return res.status(400).json({ error: 'prUrl is required' });
    }

    const parsed = parsePrUrl(prUrl);
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid PR URL format' });
    }

    // Fetch PR data
    const [prRes, filesRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      }),
      fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}/files`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      }),
    ]);

    if (!prRes.ok) {
      return res.status(prRes.status).json({ error: prRes.status === 404 ? 'PR not found or is private' : 'Failed to fetch PR' });
    }

    const pr = await prRes.json();
    const files = await filesRes.json();

    const meta = {
      repoName: `${parsed.owner}/${parsed.repo}`,
      prNumber: parsed.number,
      prTitle: pr.title,
      author: pr.user.login,
      authorAvatar: pr.user.avatar_url,
      filesChanged: pr.changed_files,
      additions: pr.additions,
      deletions: pr.deletions,
    };

    // Generate AI summary
    const truncatedFiles = files.slice(0, 10).map((f: any) => ({
      filename: f.filename,
      additions: f.additions,
      deletions: f.deletions,
      patch: f.patch?.slice(0, 500),
    }));

    const prompt = `Analyze this GitHub PR and generate a social media video summary.

PR Title: ${pr.title}
PR Description: ${pr.body?.slice(0, 1000) || 'No description'}
Files Changed: ${files.length}
Total Additions: ${pr.additions}
Total Deletions: ${pr.deletions}

Changed files:
${truncatedFiles.map((f: any) => `- ${f.filename} (+${f.additions}/-${f.deletions})`).join('\n')}`;

    const { output } = await generateText({
      model: openai('gpt-5.2'),
      output: Output.object({ schema: summarySchema }),
      prompt,
      temperature: 0.7,
    });

    if (!output) {
      throw new Error('Failed to generate summary');
    }

    return res.status(200).json({
      meta,
      summary: {
        headline: output.headline,
        vibe: output.vibe,
        bullets: output.bullets,
        emoji: output.emoji,
      },
      style: {
        accentColor: output.accentColor,
        tone: output.tone,
      },
    });
  } catch (error: any) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: error.message,
      cause: error.cause?.message,
      code: error.cause?.code,
    });
  }
}
