import {
  defineConfig
} from "./chunk-WD5XIRX3.mjs";
import "./chunk-USHNXJ63.mjs";
import "./chunk-PCSOMEUU.mjs";
import "./chunk-MN3F747K.mjs";
import "./chunk-IB4V73K4.mjs";
import {
  init_esm
} from "./chunk-244PAGAH.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: "proj_zpdwsrkbbwnyzcxwavkr",
  runtime: "node",
  logLevel: "log",
  dirs: ["./src/jobs"],
  // The max compute seconds for each task before it's considered timed out
  // Video generation needs more time: bundle + render + upload
  maxDuration: 600,
  // 10 minutes for video generation tasks
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      factor: 1.8,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 3e4,
      randomize: true
    }
  },
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
