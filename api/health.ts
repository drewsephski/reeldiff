import type { VercelRequest, VercelResponse } from "@vercel/node";

// Health check endpoint for deployment verification
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Basic health check
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "unknown",
    branch: process.env.VERCEL_GIT_COMMIT_REF || "unknown",
    env: process.env.NODE_ENV || "development",
    checks: {
      trigger: !!process.env.TRIGGER_SECRET_KEY,
      github: !!process.env.GITHUB_WEBHOOK_SECRET,
      openrouter: !!process.env.OPENROUTER_API_KEY,
    },
  };

  // Return 200 if all critical env vars are set
  const isHealthy = health.checks.trigger && health.checks.openrouter;
  
  return res.status(isHealthy ? 200 : 503).json(health);
}
