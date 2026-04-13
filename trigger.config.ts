import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_ktisyslqmyqjgtjbpivb",
  runtime: "node",
  logLevel: "log",
  dirs: ["./src/jobs"],
  // The max compute seconds for each task before it's considered timed out
  maxDuration: 300, // 5 minutes for video generation tasks
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
  },
});
