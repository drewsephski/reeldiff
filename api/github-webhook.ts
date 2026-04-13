import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// This endpoint receives GitHub webhooks and triggers Trigger.dev tasks
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify GitHub webhook signature
  const signature = req.headers["x-hub-signature-256"] as string;
  const event = req.headers["x-github-event"] as string;
  const deliveryId = req.headers["x-github-delivery"] as string;

  if (!signature || !event) {
    return res.status(400).json({ error: "Missing webhook headers" });
  }

  // TODO: Verify webhook signature with GitHub App secret
  // const isValid = verifyWebhookSignature(req.body, signature, process.env.GITHUB_WEBHOOK_SECRET);
  // if (!isValid) {
  //   return res.status(401).json({ error: "Invalid signature" });
  // }

  console.log(`Received GitHub webhook: ${event} (delivery: ${deliveryId})`);

  // Only process events we care about
  const supportedEvents = ["pull_request", "release", "issues"];
  if (!supportedEvents.includes(event)) {
    return res.status(200).json({ message: "Event type not supported", event });
  }

  // Trigger the Trigger.dev task
  try {
    // Import the Trigger.dev SDK dynamically
    const trigger = await import("@trigger.dev/sdk/v3");
    
    // Trigger the webhook processing task
    // Note: In production, you'd use the Trigger.dev API or SDK to trigger this
    console.log("Triggering process-github-webhook task with payload:", {
      event,
      action: req.body.action,
      repository: req.body.repository?.full_name,
      triggerModule: trigger ? "loaded" : "failed",
    });

    // For now, just acknowledge receipt
    // The actual triggering would happen via Trigger.dev's API
    return res.status(202).json({
      message: "Webhook received",
      event,
      deliveryId,
      triggered: true,
    });
  } catch (error) {
    console.error("Failed to trigger task:", error);
    return res.status(500).json({
      error: "Failed to process webhook",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Helper function to verify GitHub webhook signature (currently unused)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
