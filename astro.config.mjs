// @ts-check

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sentry from "@sentry/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "server",

  env: {
    schema: {
      OPENAI_API_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      GOOGLE_API_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      SENTRY_AUTH_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      PUBLIC_SENTRY_DSN: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["streamdown"],
    },
  },

  integrations: [
    react(),
    mdx({
      rehypePlugins: [], // Explicitly disable all rehype plugins including rehype-katex
    }),
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
