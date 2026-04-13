import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";
import { generateVideo } from "./generate-video";

// Lazy initialization helper for Supabase client
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }
  return createClient<Database>(url, key);
}

// GitHub webhook payload types
interface GitHubPullRequest {
  number: number;
  title: string;
  user: {
    login: string;
    avatar_url: string;
  };
  merged: boolean;
  additions: number;
  deletions: number;
  changed_files: number;
  html_url: string;
}

interface GitHubRepository {
  full_name: string;
  owner: {
    login: string;
  };
  name: string;
}

interface GitHubWebhookPayload {
  action: string;
  pull_request?: GitHubPullRequest;
  repository: GitHubRepository;
  sender: {
    login: string;
  };
}

// Main webhook processing task
export const processGitHubWebhook = task({
  id: "process-github-webhook",
  run: async (payload: GitHubWebhookPayload) => {
    console.log(`Processing webhook: ${payload.action} for ${payload.repository.full_name}`);

    // Find projects monitoring this repository
    const supabase = getSupabase();
    const { data: projects, error: projectError } = await supabase
      .from("projects")
      .select(`
        *,
        webhook_configs(*)
      `)
      .eq("repo_owner", payload.repository.owner.login)
      .eq("repo_name", payload.repository.name);

    if (projectError) {
      throw new Error(`Failed to fetch projects: ${projectError.message}`);
    }

    if (!projects || projects.length === 0) {
      console.log(`No projects found for ${payload.repository.full_name}`);
      return { processed: 0 };
    }

    const results = [];

    for (const project of projects) {
      const config = project.webhook_configs?.[0];
      
      if (!config) {
        console.log(`No webhook config for project ${project.id}`);
        continue;
      }

      // Check if this event type is configured
      const eventType = getEventType(payload);
      if (!config.events.includes(eventType)) {
        console.log(`Event ${eventType} not configured for project ${project.id}`);
        continue;
      }

      // Create video record
      const { data: video, error: videoError } = await supabase
        .from("videos")
        .insert({
          project_id: project.id,
          trigger_event: eventType,
          trigger_details: payload as unknown as Database["public"]["Tables"]["videos"]["Insert"]["trigger_details"],
          status: "pending",
        })
        .select()
        .single();

      if (videoError) {
        console.error(`Failed to create video record: ${videoError.message}`);
        continue;
      }

      console.log(`Created video record: ${video.id}`);

      // Trigger video generation
      const generateResult = await generateVideo.trigger({
        videoId: video.id,
        projectId: project.id,
        payload,
      });

      results.push({
        projectId: project.id,
        videoId: video.id,
        generateJobId: generateResult.id,
      });
    }

    return {
      processed: results.length,
      results,
    };
  },
});

function getEventType(payload: GitHubWebhookPayload): string {
  if (payload.pull_request) {
    if (payload.action === "closed" && payload.pull_request.merged) {
      return "pr_merge";
    }
    return `pr_${payload.action}`;
  }
  return payload.action;
}
