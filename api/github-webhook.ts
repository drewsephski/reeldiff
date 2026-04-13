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
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  // Only process events we care about
  const supportedEvents = ["pull_request", "release", "issues"];
  if (!supportedEvents.includes(event)) {
    return res.status(200).json({ message: "Event type not supported", event });
  }

  // Validate required fields
  if (!req.body || !req.body.action) {
    console.error("Invalid webhook payload - missing action:", req.body);
    return res.status(400).json({ error: "Invalid webhook payload" });
  }

  // Trigger the Trigger.dev task
  try {
    const { tasks } = await import("@trigger.dev/sdk/v3");
    
    const payload = {
      action: req.body.action,
      pull_request: req.body.pull_request,
      repository: req.body.repository,
      sender: req.body.sender,
    };
    
    console.log("Triggering task with payload:", JSON.stringify(payload, null, 2));
    
    // Trigger the webhook processing task
    const result = await tasks.trigger("process-github-webhook", payload);

    console.log("Triggered process-github-webhook task:", {
      runId: result.id,
      event,
      action: req.body.action,
      repository: req.body.repository?.full_name,
    });

    return res.status(202).json({
      message: "Webhook received and processing triggered",
      event,
      deliveryId,
      triggered: true,
      runId: result.id,
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
