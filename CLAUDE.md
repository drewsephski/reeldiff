# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PatchPlay transforms GitHub pull requests into shareable short-form videos (15-25 seconds). Users paste a public PR URL, OpenAI generates a catchy summary, and Remotion renders an animated video preview.

## Commands

```bash
npm run dev      # Start Vite dev server (frontend only, no API)
npm run build    # TypeScript check + Vite production build
npm run lint     # Run ESLint
vercel dev       # Full app with API (requires .env.local with OPENAI_API_KEY)
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

- `OPENAI_API_KEY`: Required for API functionality (set in `.env.local` locally, Vercel dashboard for production)

## Workflow

- Always run `npm run lint` before finishing any task to verify no lint errors were introduced
