import {
  generateVideo
} from "./chunk-4SVM6RET.mjs";
import {
  task
} from "./chunk-WD5XIRX3.mjs";
import {
  __name,
  init_esm
} from "./chunk-244PAGAH.mjs";

// src/jobs/github-webhook.ts
init_esm();
import { createClient } from "@supabase/supabase-js";
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }
  return createClient(url, key);
}
__name(getSupabase, "getSupabase");
var processGitHubWebhook = task({
  id: "process-github-webhook",
  run: /* @__PURE__ */ __name(async (payload) => {
    console.log(`Processing webhook: ${payload.action} for ${payload.repository.full_name}`);
    const supabase = getSupabase();
    const { data: projects, error: projectError } = await supabase.from("projects").select(`
        *,
        webhook_configs(*)
      `).eq("repo_owner", payload.repository.owner.login).eq("repo_name", payload.repository.name);
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
      const eventType = getEventType(payload);
      if (!config.events.includes(eventType)) {
        console.log(`Event ${eventType} not configured for project ${project.id}`);
        continue;
      }
      const { data: video, error: videoError } = await supabase.from("videos").insert({
        project_id: project.id,
        trigger_event: eventType,
        trigger_details: payload,
        status: "pending",
        source: "webhook"
      }).select().single();
      if (videoError) {
        console.error(`Failed to create video record: ${videoError.message}`);
        continue;
      }
      console.log(`Created video record: ${video.id}`);
      const generateResult = await generateVideo.trigger({
        videoId: video.id,
        projectId: project.id,
        payload
      });
      results.push({
        projectId: project.id,
        videoId: video.id,
        generateJobId: generateResult.id
      });
    }
    return {
      processed: results.length,
      results
    };
  }, "run")
});
function getEventType(payload) {
  if (payload.pull_request) {
    if (payload.action === "closed" && payload.pull_request.merged) {
      return "pr_merge";
    }
    return `pr_${payload.action}`;
  }
  return payload.action;
}
__name(getEventType, "getEventType");

export {
  processGitHubWebhook
};
//# sourceMappingURL=chunk-M5TASOQU.mjs.map
