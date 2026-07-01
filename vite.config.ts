import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const LIVE_SRC = resolve(here, "src/data/live.json");

/**
 * Serve the canonical live data at a stable `/live.json` — in dev via
 * middleware, and in the build by emitting it into the output — so the running
 * app can poll it for score updates. Source of truth stays src/data/live.json
 * (what the update-data job commits); this just also exposes it as a URL.
 */
function liveJson(): Plugin {
  return {
    name: "wc26-live-json",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.split("?")[0] === "/live.json") {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(readFileSync(LIVE_SRC));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "live.json",
        source: readFileSync(LIVE_SRC, "utf8"),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), liveJson()],
});
