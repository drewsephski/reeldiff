import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Lazy initialization helper for Supabase client
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }
  return createClient<Database>(url, key);
}

interface DistributeVideoPayload {
  videoId: string;
  projectId: string;
  videoUrl: string;
  thumbnailUrl: string;
  videoScript: {
    meta: {
      repoName: string;
      prNumber?: number;
    };
    summary: {
      headline: string;
      bullets: string[];
    };
  };
}

export const distributeVideo = task({
  id: "distribute-video",
  run: async ({ videoId, projectId, videoUrl, thumbnailUrl, videoScript }: DistributeVideoPayload) => {
    console.log(`Distributing video ${videoId} for project ${projectId}`);

    const supabase = getSupabase();

    // Get webhook configuration
    const { data: config, error: configError } = await supabase
      .from("webhook_configs")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (configError) {
      console.error(`Failed to fetch webhook config: ${configError.message}`);
      return { distributed: 0 };
    }

    if (!config) {
      console.log(`No webhook config found for project ${projectId}`);
      return { distributed: 0 };
    }

    const results = [];

    // Post to Slack if configured
    if (config.slack_webhook_url) {
      try {
        await postToSlack(config.slack_webhook_url, {
          videoUrl,
          thumbnailUrl,
          headline: videoScript.summary.headline,
          repoName: videoScript.meta.repoName,
          prNumber: videoScript.meta.prNumber,
        });
        results.push({ channel: "slack", success: true });
      } catch (error) {
        console.error("Failed to post to Slack:", error);
        results.push({ channel: "slack", success: false, error: String(error) });
      }
    }

    // Post to Discord if configured
    if (config.discord_webhook_url) {
      try {
        await postToDiscord(config.discord_webhook_url, {
          videoUrl,
          thumbnailUrl,
          headline: videoScript.summary.headline,
          repoName: videoScript.meta.repoName,
          prNumber: videoScript.meta.prNumber,
        });
        results.push({ channel: "discord", success: true });
      } catch (error) {
        console.error("Failed to post to Discord:", error);
        results.push({ channel: "discord", success: false, error: String(error) });
      }
    }

    // Auto-post to social if enabled
    if (config.auto_post_social) {
      // TODO: Implement social posting via connected accounts
      console.log("Auto-post to social enabled - implementing soon");
    }

    return {
      distributed: results.filter((r) => r.success).length,
      results,
    };
  },
});

interface PostData {
  videoUrl: string;
  thumbnailUrl: string;
  headline: string;
  repoName: string;
  prNumber?: number;
}

async function postToSlack(webhookUrl: string, data: PostData): Promise<void> {
  const prText = data.prNumber ? ` #${data.prNumber}` : "";
  
  const payload = {
    text: `🎬 New video generated for ${data.repoName}${prText}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎬 New Video Generated",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${data.headline}*\nRepository: ${data.repoName}${prText}`,
        },
        accessory: {
          type: "image",
          image_url: data.thumbnailUrl,
          alt_text: "Video thumbnail",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Watch Video",
              emoji: true,
            },
            url: data.videoUrl,
            action_id: "watch_video",
          },
        ],
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
  }
}

async function postToDiscord(webhookUrl: string, data: PostData): Promise<void> {
  const prText = data.prNumber ? ` #${data.prNumber}` : "";
  
  const payload = {
    content: `🎬 New video generated for ${data.repoName}${prText}`,
    embeds: [
      {
        title: data.headline,
        description: `Repository: ${data.repoName}${prText}`,
        image: {
          url: data.thumbnailUrl,
        },
        color: 0x61dafb,
        timestamp: new Date().toISOString(),
        footer: {
          text: "Generated by ReelDiff",
        },
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
  }
}
