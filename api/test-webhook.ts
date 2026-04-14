import type { VercelRequest, VercelResponse } from "@vercel/node";

// Test endpoint to trigger webhook processing without signature verification
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { tasks } = await import("@trigger.dev/sdk/v3");
    
    // Log environment info for debugging
    console.log("[TEST] Trigger.dev environment check:", {
      secretKeyPrefix: process.env.TRIGGER_SECRET_KEY?.slice(0, 10) + "...",
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    });
    
    // Test payload matching GitHub webhook structure
    const testPayload = {
      action: "opened",
      repository: {
        full_name: "test/repo",
        owner: { login: "test" },
        name: "repo"
      },
      sender: { login: "testuser" },
      pull_request: {
        number: 1,
        title: "Test PR",
        user: { login: "testuser", avatar_url: "https://github.com/github.png" },
        merged: false,
        additions: 10,
        deletions: 5,
        changed_files: 2,
        html_url: "https://github.com/test/repo/pull/1"
      }
    };
    
    console.log("[TEST] Triggering process-github-webhook with payload:", JSON.stringify(testPayload, null, 2));
    
    const result = await tasks.trigger("process-github-webhook", testPayload);

    console.log("[TEST] Task triggered:", result);

    return res.status(202).json({
      message: "Test webhook triggered",
      runId: result.id,
      envInfo: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasTriggerSecret: !!process.env.TRIGGER_SECRET_KEY,
      },
      payload: testPayload
    });
  } catch (error) {
    console.error("[TEST] Failed to trigger:", error);
    return res.status(500).json({
      error: "Failed to trigger test",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
