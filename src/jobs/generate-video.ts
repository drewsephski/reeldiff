import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";
import { distributeVideo } from "./distribute-video";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execSync } from "child_process";
import { readFile } from "fs/promises";

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

      // Build the video bundle
      console.log("Building Remotion bundle...");
      const bundleLocation = await new Promise<string>((resolve, reject) => {
        const outputDir = `/tmp/remotion-bundle-${videoId}`;
        try {
          execSync(
            `npx remotion bundle src/video/index.tsx --out-dir=${outputDir}`,
            { cwd: process.cwd(), stdio: "pipe" }
          );
          resolve(outputDir);
        } catch (err) {
          reject(err);
        }
      });

      console.log("Bundle created at:", bundleLocation);

      // Select the composition
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: "PatchPlay",
        inputProps: videoScript,
      });

      // Render the video
      console.log("Rendering video...");
      const outputPath = `/tmp/${videoId}.mp4`;
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputPath,
        inputProps: videoScript,
      });

      console.log("Video rendered to:", outputPath);

      // Read the video file
      const videoBuffer = await readFile(outputPath);
      console.log(`Video size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);

      // Upload to Supabase Storage
      const storagePath = `${projectId}/${videoId}.mp4`;
      console.log("Uploading to Supabase Storage...");

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(storagePath, videoBuffer, {
          contentType: "video/mp4",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload video: ${uploadError.message}`);
      }

      console.log("Video uploaded successfully");

      // Generate thumbnail from the composition (render frame at 2 seconds)
      console.log("Generating thumbnail...");
      const thumbnailPath = `/tmp/${videoId}-thumb.jpg`;
      await renderStill({
        composition,
        serveUrl: bundleLocation,
        output: thumbnailPath,
        frame: 60, // 2 seconds at 30fps - shows intro scene
        imageFormat: "jpeg",
        jpegQuality: 85,
        scale: 0.5, // 960x540 - good for thumbnails
        inputProps: videoScript,
      });

      // Read and upload thumbnail
      const thumbnailBuffer = await readFile(thumbnailPath);
      console.log(`Thumbnail size: ${(thumbnailBuffer.length / 1024).toFixed(2)} KB`);

      const thumbnailStoragePath = `${projectId}/${videoId}-thumb.jpg`;
      const { error: thumbnailUploadError } = await supabase.storage
        .from("videos")
        .upload(thumbnailStoragePath, thumbnailBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (thumbnailUploadError) {
        console.error("Failed to upload thumbnail:", thumbnailUploadError.message);
        // Don't throw - video is already uploaded, thumbnail is optional
      } else {
        console.log("Thumbnail uploaded successfully");
      }

      // Generate signed URLs (valid for 7 days)
      const { data: videoUrlData } = await supabase.storage
        .from("videos")
        .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

      const videoUrl = videoUrlData?.signedUrl || "";

      // Get thumbnail URL (use signed URL if uploaded, otherwise fallback)
      let thumbnailUrl = `https://ui-avatars.com/api/?name=PR+${prData.number}&background=random&size=400`;
      if (!thumbnailUploadError) {
        const { data: thumbUrlData } = await supabase.storage
          .from("videos")
          .createSignedUrl(thumbnailStoragePath, 60 * 60 * 24 * 7);
        if (thumbUrlData?.signedUrl) {
          thumbnailUrl = thumbUrlData.signedUrl;
        }
      }

      await supabase
        .from("videos")
        .update({
          status: "completed",
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          storage_path: storagePath,
          metadata: {
            ...videoScript,
            thumbnailStoragePath: thumbnailUploadError ? null : thumbnailStoragePath,
          },
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
