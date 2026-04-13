import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { generateText, Output } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';

config({ path: '.env.local' });

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const summarySchema = z.object({
  headline: z.string().describe('A catchy, short headline (max 10 words) that captures the essence of this PR'),
  vibe: z.enum(['feature', 'fix', 'refactor', 'docs', 'chore']),
  bullets: z.array(z.string()).min(3).max(5).describe('Key points (max 10 words each) explaining what changed'),
  emoji: z.string().describe('A single emoji that represents this PR'),
  accentColor: z.string().describe('A hex color that matches the vibe (bright, playful colors work best)'),
  tone: z.enum(['celebratory', 'relief', 'technical', 'minor']).describe('celebratory for new features, relief for bug fixes, technical for refactors, minor for small changes'),
});

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

    const { prUrl } = req.body;
    if (!prUrl || typeof prUrl !== 'string') {
      return res.status(400).json({ error: 'prUrl is required' });
    }

    const parsed = parsePrUrl(prUrl);
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid PR URL format' });
    }

    // Fetch PR data
    const prApiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}`;
    console.log('Fetching PR:', prApiUrl);

    const [prRes, filesRes] = await Promise.all([
      fetch(prApiUrl, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      }),
      fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}/files`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      }),
    ]);

    console.log('GitHub PR response status:', prRes.status);

    if (!prRes.ok) {
      const errorText = await prRes.text();
      console.error('GitHub API error:', prRes.status, errorText);
      return res.status(prRes.status).json({ 
        error: prRes.status === 404 ? 'PR not found or is private' : `Failed to fetch PR: ${prRes.status}` 
      });
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
    const truncatedFiles = files.slice(0, 10).map((f: { filename: string; additions: number; deletions: number; patch?: string }) => ({
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
${truncatedFiles.map((f: { filename: string; additions: number; deletions: number }) => `- ${f.filename} (+${f.additions}/-${f.deletions})`).join('\n')}`;

    // Use generateText with Output.object() for structured output
    console.log('Calling OpenRouter with model: google/gemini-3.1-flash-lite-preview');
    console.log('Prompt length:', prompt.length);

    let output;
    try {
      const result = await generateText({
        model: openrouter('google/gemini-3.1-flash-lite-preview'),
        output: Output.object({
          schema: summarySchema,
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
        vibe: output.vibe,
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
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      cause: error instanceof Error ? (error.cause as { message?: string; code?: string })?.message : undefined,
      code: error instanceof Error ? (error.cause as { message?: string; code?: string })?.code : undefined,
    });
  }
}