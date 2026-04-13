import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";
import { distributeVideo } from "./distribute-video";

// Lazy initialization helper for Supabase client
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }
  return createClient<Database>(url, key);
}

interface GenerateVideoPayload {
  videoId: string;
  projectId: string;
  payload: {
    pull_request?: {
      number: number;
      title: string;
      user: {
        login: string;
        avatar_url: string;
      };
      additions: number;
      deletions: number;
      changed_files: number;
      html_url: string;
    };
    repository: {
      full_name: string;
    };
  };
}

export const generateVideo = task({
  id: "generate-video",
  run: async ({ videoId, projectId, payload }: GenerateVideoPayload) => {
    console.log(`Starting video generation for video ${videoId}`);

    const supabase = getSupabase();

    // Update status to processing
    await supabase
      .from("videos")
      .update({ status: "processing" })
      .eq("id", videoId);

    try {
      // Fetch PR details from GitHub API
      const prData = payload.pull_request;
      if (!prData) {
        throw new Error("No PR data in payload");
      }

      // Call your existing analyze API to get video script
      const analyzeResponse = await fetch(
        `${process.env.APP_URL}/api/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prUrl: prData.html_url,
          }),
        }
      );

      if (!analyzeResponse.ok) {
        throw new Error(`Analyze API failed: ${await analyzeResponse.text()}`);
      }

      const videoScript = await analyzeResponse.json();

      // TODO: Render video using Remotion (this would be done via Remotion Lambda or local rendering)
      // For now, we'll simulate the video generation
      console.log("Video script generated:", videoScript);

      // Simulate video generation delay
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Store video metadata
      const videoUrl = `https://storage.example.com/videos/${videoId}.mp4`;
      const thumbnailUrl = `https://storage.example.com/thumbnails/${videoId}.jpg`;

      await supabase
        .from("videos")
        .update({
          status: "completed",
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          metadata: videoScript,
          completed_at: new Date().toISOString(),
        })
        .eq("id", videoId);

      // Trigger distribution to configured channels
      await distributeVideo.trigger({
        videoId,
        projectId,
        videoUrl,
        thumbnailUrl,
        videoScript,
      });

      return {
        videoId,
        status: "completed",
        videoUrl,
      };
    } catch (error) {
      console.error(`Video generation failed for ${videoId}:`, error);

      await supabase
        .from("videos")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", videoId);

      throw error;
    }
  },
});
