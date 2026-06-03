// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

const config = defineCloudflareConfig({
	// For best results consider enabling R2 caching
	// See https://opennext.js.org/cloudflare/caching for more details
	// incrementalCache: r2IncrementalCache
});

// Override the build command to call next build directly, preventing infinite
// recursion since the default "npm run build" would trigger prebuild →
// opennextjs-cloudflare build again.
// Note: buildCommand can't be passed to defineCloudflareConfig() because its
// implementation destructures only Cloudflare-specific fields and drops the rest.
config.buildCommand = "npx next build";

export default config;
