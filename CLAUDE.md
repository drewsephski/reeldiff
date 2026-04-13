# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PatchPlay transforms GitHub pull requests into shareable short-form videos (15-25 seconds). Users paste a public PR URL, OpenAI generates a catchy summary, and Remotion renders an animated video preview.

## Commands

```bash
npm run dev           # Start Vite dev server (frontend only, no API)
npm run build         # TypeScript check + Vite production build
npm run lint          # Run ESLint
vercel dev            # Full app with API (requires .env.local with OPENAI_API_KEY)
npm run trigger:dev   # Start Trigger.dev dev server for background jobs
npm run trigger:deploy # Deploy Trigger.dev tasks to production
```

## Architecture

**Frontend (src/):** Vite + React 19 + TypeScript with Remotion for video rendering

**Backend (api/):** Vercel Edge Functions - single endpoint `POST /api/analyze` that:

1. Parses PR or repository URL to extract owner/repo/number
2. Fetches PR or repository metadata from GitHub API
3. Calls OpenAI gpt-4o-mini for summary generation
4. Returns VideoScript object

**Video Composition (src/video/):**

- `Composition.tsx` orchestrates 4 scene types
- Scenes: IntroScene (3s) → HeadlineScene (3.5s) → BulletScene (2.5s each, 3-5 bullets) → OutroScene (3s)
- `layouts/` contains 4 visual variants (A-D) for bullet points

**Core Data Model (src/types.ts):** `VideoScript` interface with:

- `meta`: repo name, PR number, author, files changed, additions/deletions
- `summary`: AI headline, vibe (feature/fix/refactor/docs/chore), bullets, emoji
- `style`: accent color, tone

## Key Patterns

- Three app states in App.tsx: input → loading → preview
- Remotion Player renders at 1920×1080 (16:9), 30fps
- Styling uses custom CSS with Bricolage Grotesque + DM Sans fonts
- Loading state uses morphing blob animation

## Environment Variables

### Required for Core Functionality

- `OPENROUTER_API_KEY`: Required for AI summary generation (OpenRouter provides access to multiple LLMs)

### Required for Payment System

- `STRIPE_SECRET_KEY`: Stripe secret key (starts with `sk_test_` or `sk_live_`)
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for frontend (starts with `pk_test_` or `pk_live_`)
- `STRIPE_WEBHOOK_SECRET`: Webhook secret for verifying Stripe events (starts with `whsec_`)
- `PRICE_STARTER`: Stripe Price ID for the $5/5-credits tier
- `PRICE_PRO`: Stripe Price ID for the $15/20-credits tier
- `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`: Vercel KV credentials (auto-populated when adding KV to project)

## Payment System

The app includes a credit-based payment system:

- **Free tier**: 1 free video per device
- **Starter**: $5 for 5 credits
- **Pro**: $15 for 20 credits
- Credits are device-tracked using fingerprinting (no auth required)
- Stripe Checkout handles payments, webhook adds credits to Vercel KV

## Supabase Database

The app uses Supabase PostgreSQL for data persistence:

**Tables:**

- `projects` - GitHub repos being monitored (user_id, repo_owner, repo_name)
- `webhook_configs` - Event settings (events[], slack_webhook_url, discord_webhook_url)
- `videos` - Generated video metadata (status, video_url, trigger_event, metadata)
- `social_connections` - OAuth tokens for social platforms

**Security:**

- RLS enabled on all tables
- Users can only access their own projects/videos
- Service role policies for webhook processing

**Client:** `@/src/lib/supabase.ts` - initialized with `createClient<Database>()`

## Trigger.dev Background Jobs

Long-running tasks are handled by Trigger.dev:

**Tasks:**

- `process-github-webhook` - Receives GitHub webhooks, finds matching projects
- `generate-video` - Renders video via Remotion (up to 5 min timeout)
- `distribute-video` - Posts to Slack/Discord webhooks

**Configuration:** `trigger.config.ts`

- Max duration: 300 seconds (5 minutes)
- Retries: 3 attempts with exponential backoff

## GitHub Webhooks

**Endpoint:** `POST /api/github-webhook`

Receives GitHub App webhooks for:

- `pull_request` (closed + merged)
- `release` (published)
- `issues` (closed)

**Setup:**

1. Create GitHub App in Settings → Developer Settings
2. Webhook URL: `https://yourapp.com/api/github-webhook`
3. Permissions: Pull requests (read), Contents (read)
4. Subscribe to events

## Workflow

- Always run `npm run lint` before finishing any task to verify no lint errors were introduced
- Run `npm run build` to verify TypeScript compiles correctly
- When making Supabase schema changes, use `execute_sql` (MCP) or `supabase db query` (CLI) for iteration, then `supabase db pull` to commit migrations
