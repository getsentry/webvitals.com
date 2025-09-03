// @ts-check

import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sentry from "@sentry/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
	},

	integrations: [
		react(),
		sentry({
			sourceMapsUploadOptions: {
				project: "webvitals",
				org: "sergtech",
				authToken: import.meta.env.SENTRY_AUTH_TOKEN,
			},
		}),
	],

	adapter: vercel(),
});
