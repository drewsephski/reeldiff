import { defineConfig } from "@trigger.dev/sdk";
import { puppeteer } from "@trigger.dev/build/extensions/puppeteer";

export default defineConfig({
  project: "proj_zpdwsrkbbwnyzcxwavkr",
  runtime: "node",
  logLevel: "log",
  dirs: ["./src/jobs"],
  // The max compute seconds for each task before it's considered timed out
  // Video generation needs more time: bundle + render + upload
  maxDuration: 600, // 10 minutes for video generation tasks
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      factor: 1.8,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
      randomize: true,
    },
  },
  build: {
    // External packages that need to be included
    external: ["@supabase/supabase-js"],
    extensions: [
      puppeteer(), // Required for Remotion rendering
    ],
  },
});
