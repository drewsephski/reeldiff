# ReelDiff 🎬

> **Turn code into stories.** Generate shareable videos from GitHub PRs and repositories in seconds.

Paste a PR link. Paste a repo URL. Get a polished, animated video with headlines, key points, and stats — ready to share on Twitter, LinkedIn, Slack, or Discord. No editing required.

## **[Try it live](https://reeldiff.vercel.app)**

---

## ✨ What You Can Do

### 🚀 Share PR Highlights
Shipped a big feature? Fixed a nasty bug? Paste your PR link and get a video that shows:
- What changed (in plain English)
- Files modified, lines added/removed
- The story behind the work

Perfect for team updates, standup demos, or showing off your craft.

### ⭐ Showcase Repositories
Building in public? Drop any GitHub repo URL and create a hype video featuring:
- Star count, forks, and primary language
- Auto-extracted key features from the README
- The right emoji and vibe (hype, educational, celebratory, or technical)

Great for launching open source projects or giving existing repos a visibility boost.

### 🤖 Auto-Distribute to Your Team
Configure webhooks and videos auto-post to:
- **Slack** — Rich blocks with thumbnails and watch buttons
- **Discord** — Embeds with timestamps and repo info
- More channels coming soon (Twitter, LinkedIn, YouTube)

Ship code → Video generates → Team gets notified. Zero manual work.

---

## 🎬 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Paste URL  │────▶│  AI Analysis │────▶│   Script    │
│  (PR/Repo)  │     │  (Vercel AI) │     │  Generation │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                               │
                              ┌────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  Video Render   │
                    │   (Remotion)    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌──────────┐       ┌──────────┐       ┌────────────┐
   │  Watch   │       │  Share   │       │  Webhook   │
   │  Video   │       │  Link    │       │  Dispatch  │
   └──────────┘       └──────────┘       └────────────┘
```

1. **Paste** a GitHub PR or repository URL
2. **AI analyzes** the diff/README — extracting changes, features, and tone
3. **Generates** a video script with headline, bullets, emoji, and accent color
4. **Renders** a 15-30 second animated video (intro → content → outro)
5. **Delivers** a shareable link + auto-posts to configured channels

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite + Framer Motion |
| **Video Engine** | Remotion — programmatic video generation |
| **AI/ML** | Vercel AI SDK + OpenRouter (Gemini Flash) |
| **Background Jobs** | Trigger.dev — reliable async processing |
| **Auth** | Clerk — seamless sign-in |
| **Payments** | Stripe — credit-based usage |
| **Storage** | Supabase — videos, thumbnails, metadata |
| **Deployment** | Vercel — serverless functions + edge |

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/drewsephski/patchplay.git
cd patchplay
npm install

# Set up environment
cp .env.example .env.local
# Fill in your Clerk, Stripe, Supabase, OpenRouter, and Trigger.dev keys

# Run dev server
npm run dev

# Start Trigger.dev dev server (in another terminal)
npm run trigger:dev
```

---

## 📋 Environment Variables

```bash
# Auth (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI (OpenRouter)
OPENROUTER_API_KEY=sk-or-...

# Database & Storage (Supabase)
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Background Jobs (Trigger.dev)
TRIGGER_SECRET_KEY=tr_dev_...

# App
APP_URL=http://localhost:5173
```

---

## 🎯 Use Cases

**For Individual Developers**
- Share your latest PR on Twitter/LinkedIn with a professional video
- Build your personal brand by showcasing your best work
- Document your learning journey with visual changelogs

**For Teams**
- Auto-post PR summaries to Slack so everyone knows what's shipping
- Create weekly demo reels of merged work
- Keep stakeholders informed without writing lengthy updates

**For Open Source Maintainers**
- Generate hype videos for new releases
- Showcase your project's growth and star milestones
- Make your README come alive with animated previews

**For DevRel & Marketing**
- Turn technical changelogs into engaging social content
- Create consistent, on-brand video assets at scale

---

## 🏗️ Architecture Highlights

### Credit-Based Usage
- Free tier for new users
- Stripe-powered credit packs ($5 for 10 videos)
- Graceful paywall when credits run out

### Reliable Background Processing
- Trigger.dev handles video rendering off the main thread
- Automatic retries, checkpoints, and failure handling
- Scales from hobby projects to high-volume usage

### Multi-Channel Distribution
- Webhook configuration per project
- Slack/Discord rich formatting with thumbnails
- Pluggable architecture for adding new channels

### Type-Safe Throughout
- Shared types between frontend, API, and jobs
- Zod schemas for AI output validation
- End-to-end TypeScript

---

## 📝 License

MIT — use it, fork it, build on it.

---

Built by [@drewsephski](https://github.com/drewsephski) · [Try it live](https://reeldiff.vercel.app)

