import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// Disable body parsing to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body from request stream
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

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

  // Read raw body for signature verification
  const rawBody = await getRawBody(req);

  // Verify webhook signature with GitHub App secret
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  if (webhookSecret) {
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  } else {
    console.warn("GITHUB_WEBHOOK_SECRET not set, skipping signature verification");
  }

  console.log(`Received GitHub webhook: ${event} (delivery: ${deliveryId})`);

  // Only process events we care about
  const supportedEvents = ["pull_request", "release", "issues"];
  if (!supportedEvents.includes(event)) {
    return res.status(200).json({ message: "Event type not supported", event });
  }

  // Parse the JSON body after verification
  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf-8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  // Validate required fields
  if (!payload || !payload.action) {
    console.error("Invalid webhook payload - missing action:", payload);
    return res.status(400).json({ error: "Invalid webhook payload" });
  }

  console.log("Parsed webhook payload:", JSON.stringify(payload, null, 2));

  // Trigger the Trigger.dev task
  try {
    const { tasks } = await import("@trigger.dev/sdk/v3");
    
    const taskPayload = {
      action: payload.action,
      pull_request: payload.pull_request,
      repository: payload.repository,
      sender: payload.sender,
    };
    
    console.log("Triggering task with payload:", JSON.stringify(taskPayload, null, 2));
    
    // Trigger the webhook processing task
    const result = await tasks.trigger("process-github-webhook", taskPayload);

    console.log("Triggered process-github-webhook task:", {
      runId: result.id,
      event,
      action: payload.action,
      repository: payload.repository?.full_name,
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

// Helper function to verify GitHub webhook signature
function verifyWebhookSignature(
  payload: Buffer,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
