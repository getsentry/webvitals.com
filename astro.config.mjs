// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import sentry from "@sentry/astro";

import vercel from "@astrojs/vercel";

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